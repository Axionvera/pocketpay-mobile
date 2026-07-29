import { classifyNetworkError } from './useNetworkStatus';
import type { NetworkState } from '../types/network';

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.AppState = { currentState: 'active', addEventListener: jest.fn(() => ({ remove: jest.fn() })) };
  return RN;
});

jest.mock('./useOnlineStatus', () => ({
  useOnlineStatus: jest.fn(),
}));

import { useOnlineStatus } from './useOnlineStatus';
import { renderHook } from '@testing-library/react-native';
import { useNetworkState } from './useNetworkState';

const mockUseOnlineStatus = useOnlineStatus as jest.MockedFunction<typeof useOnlineStatus>;

function setupOnlineStatus(overrides: Partial<{ isOnline: boolean; isChecking: boolean }> = {}) {
  mockUseOnlineStatus.mockReturnValue({
    isOnline: true,
    isChecking: false,
    checkNow: jest.fn(),
    ...overrides,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useNetworkState', () => {
  it('returns online when isOnline and no error', () => {
    setupOnlineStatus({ isOnline: true, isChecking: false });

    const { result } = renderHook(() => useNetworkState());
    expect(result.current.state).toBe('online');
    expect(result.current.disableWriteActions).toBe(false);
  });

  it('returns offline when isOnline is false', () => {
    setupOnlineStatus({ isOnline: false, isChecking: false });

    const { result } = renderHook(() => useNetworkState());
    expect(result.current.state).toBe('offline');
    expect(result.current.disableWriteActions).toBe(true);
  });

  it('returns service-unavailable when online with service error', () => {
    setupOnlineStatus({ isOnline: true, isChecking: false });

    const { result } = renderHook(() =>
      useNetworkState({ error: 'Horizon returned 503 Service Unavailable' }),
    );
    expect(result.current.state).toBe('service-unavailable');
    expect(result.current.disableWriteActions).toBe(true);
  });

  it('returns degraded when online with offline-pattern error', () => {
    setupOnlineStatus({ isOnline: true, isChecking: false });

    const { result } = renderHook(() =>
      useNetworkState({ error: 'Network request failed' }),
    );
    expect(result.current.state).toBe('degraded');
    expect(result.current.disableWriteActions).toBe(false);
  });

  it('returns unknown when checking and no error', () => {
    setupOnlineStatus({ isOnline: true, isChecking: true });

    const { result } = renderHook(() => useNetworkState());
    expect(result.current.state).toBe('unknown');
  });

  it('returns online when checking finishes with no error', () => {
    setupOnlineStatus({ isOnline: true, isChecking: false });

    const { result } = renderHook(() => useNetworkState());
    expect(result.current.state).toBe('online');
  });

  it('offline takes priority over service error', () => {
    setupOnlineStatus({ isOnline: false, isChecking: false });

    const { result } = renderHook(() =>
      useNetworkState({ error: 'Horizon returned 503' }),
    );
    expect(result.current.state).toBe('offline');
  });
});
