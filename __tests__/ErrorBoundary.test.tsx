import React, { useState } from 'react';
import { View, Text, Button as RNButton } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock lucide icons to simplify render tests
jest.mock('lucide-react-native', () => ({
  AlertTriangle: () => null,
  ChevronDown: () => null,
  ChevronUp: () => null,
  Bug: () => null,
}));

import { ErrorBoundary } from '../src/components/ErrorBoundary';

// Suppress expected console.error logs during error boundary test executions
const originalConsoleError = console.error;

beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// A component that throws an error when a flag is set
const ProblemChild: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Simulated runtime error');
  }
  return <Text>Normal Child Component</Text>;
};

// Interactive test component to test recovery action
const StatefulProblemContainer: React.FC<{ onResetCb?: () => void }> = ({ onResetCb }) => {
  const [hasError, setHasError] = useState(true);

  return (
    <ErrorBoundary
      onReset={() => {
        setHasError(false);
        if (onResetCb) onResetCb();
      }}
    >
      {hasError ? <ProblemChild shouldThrow={true} /> : <Text>Recovered Normal Content</Text>}
    </ErrorBoundary>
  );
};

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(getByText('Normal Child Component')).toBeTruthy();
  });

  it('captures child exception and renders fallback UI with friendly message', () => {
    const { getByText, queryByText } = render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    // Child component should no longer be rendered
    expect(queryByText('Normal Child Component')).toBeNull();

    // Friendly error screen titles and messages should be present
    expect(getByText('Algo salió mal')).toBeTruthy();
    expect(
      getByText(
        'Ha ocurrido un problema inesperado en la aplicación. No te preocupes, tus datos y fondos en la red están seguros.'
      )
    ).toBeTruthy();

    // Recovery action button should exist
    expect(getByText('Reintentar')).toBeTruthy();
  });

  it('triggers recovery action and resets error state on "Reintentar" button press', () => {
    const onResetSpy = jest.fn();
    const { getByText, queryByText } = render(
      <StatefulProblemContainer onResetCb={onResetSpy} />
    );

    // Verify fallback is initially displayed
    expect(getByText('Algo salió mal')).toBeTruthy();

    // Press retry button
    fireEvent.press(getByText('Reintentar'));

    // Verify onReset callback was called and child recovered
    expect(onResetSpy).toHaveBeenCalledTimes(1);
    expect(queryByText('Algo salió mal')).toBeNull();
    expect(getByText('Recovered Normal Content')).toBeTruthy();
  });

  it('supports custom fallback render function prop', () => {
    const { getByText } = render(
      <ErrorBoundary
        fallback={({ error, resetError }) => (
          <View>
            <Text>Custom Fallback: {error?.message}</Text>
            <RNButton title="Custom Reset" onPress={resetError} />
          </View>
        )}
      >
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText('Custom Fallback: Simulated runtime error')).toBeTruthy();
    expect(getByText('Custom Reset')).toBeTruthy();
  });

  it('hides technical error stack trace in production mode (__DEV__ = false)', () => {
    const originalDev = global.__DEV__;
    try {
      global.__DEV__ = false;

      const { getByText, queryByText } = render(
        <ErrorBoundary>
          <ProblemChild shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText('Algo salió mal')).toBeTruthy();
      expect(queryByText('Detalles de depuración (Dev Only)')).toBeNull();
      expect(queryByText('Simulated runtime error')).toBeNull();
    } finally {
      global.__DEV__ = originalDev;
    }
  });

  it('allows expanding technical details in development mode (__DEV__ = true)', () => {
    const originalDev = global.__DEV__;
    try {
      global.__DEV__ = true;

      const { getByText, queryByText } = render(
        <ErrorBoundary>
          <ProblemChild shouldThrow={true} />
        </ErrorBoundary>
      );

      // Dev section header should be visible
      const devHeader = getByText('Detalles de depuración (Dev Only)');
      expect(devHeader).toBeTruthy();

      // Error message should initially be collapsed
      expect(queryByText('Simulated runtime error')).toBeNull();

      // Toggle dev section
      fireEvent.press(devHeader);

      // Error message should now be visible
      expect(getByText('Simulated runtime error')).toBeTruthy();
    } finally {
      global.__DEV__ = originalDev;
    }
  });
});
