import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import TransactionDetailScreen from '../app/transaction/[id]';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  ArrowUpRight: () => null,
  ArrowDownLeft: () => null,
  ExternalLink: () => null,
}));

describe('Transaction detail screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });

  it('renders key transaction info and opens the explorer link', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      id: 'tx-123',
      transaction: JSON.stringify({
        id: 'tx-123',
        hash: 'abc123def456',
        amount: '50.0000000',
        asset: 'XLM',
        from: 'GFROM123',
        to: 'GTO456',
        createdAt: '2024-01-15T10:30:00Z',
        memo: 'Dinner',
      }),
    });

    const { getByText } = render(<TransactionDetailScreen />);

    expect(getByText('Transaction Details')).toBeTruthy();
    expect(getByText('abc123def456')).toBeTruthy();
    expect(getByText('50.0000000')).toBeTruthy();
    expect(getByText('XLM')).toBeTruthy();
    expect(getByText('GFROM123')).toBeTruthy();
    expect(getByText('GTO456')).toBeTruthy();

    fireEvent.press(getByText('View on explorer'));
    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://stellar.expert/explorer/testnet/tx/abc123def456'
    );
  });
});
