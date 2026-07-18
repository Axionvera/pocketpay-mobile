/**
 * History Screen – Pagination UI Tests
 *
 * Acceptance criteria covered:
 *  AC-H1 – Screen calls refreshWalletData on mount.
 *  AC-H2 – Transaction rows are rendered for each item.
 *  AC-H3 – Empty state is shown when there are no transactions and not loading.
 *  AC-H4 – Loading-more indicator is shown while isLoadingMore is true.
 *  AC-H5 – End-of-list indicator is shown when hasMoreTransactions is false
 *           and there is at least one transaction.
 *  AC-H6 – Neither footer indicator is shown when hasMoreTransactions is true
 *           and isLoadingMore is false (more items remain but not currently fetching).
 *  AC-H7 – loadMoreTransactions is called when onEndReached fires.
 */

import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('../src/store/walletStore');
jest.mock('../src/store/appStore');
jest.mock('../src/services/stellar');
jest.mock('expo-router');
jest.mock('lucide-react-native', () => ({
  Clock: () => null,
  ArrowUpRight: () => null,
  ArrowDownLeft: () => null,
}));

import { useWalletStore } from '../src/store/walletStore';
import HistoryScreen from '../app/(tabs)/history';

const mockUseWalletStore = useWalletStore as jest.MockedFunction<typeof useWalletStore>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeTx = (id: string) => ({
  id,
  type: 'payment',
  created_at: '2024-01-01T00:00:00Z',
  amount: '10.0000000',
  asset_type: 'native',
  source_account: 'GOTHER',
  to: 'GPUBLIC123',
  from: 'GOTHER',
});

const baseStore = {
  publicKey: 'GPUBLIC123',
  balance: '100.0000000',
  transactions: [],
  isLoading: false,
  isLoadingMore: false,
  hasMoreTransactions: false,
  nextCursor: null,
  error: null,
  refreshWalletData: jest.fn(),
  loadMoreTransactions: jest.fn(),
  setWallet: jest.fn(),
  loadWalletFromStorage: jest.fn(async () => true),
  clearWallet: jest.fn(),
  getSecretKey: jest.fn(async () => 'SSECRET123'),
};

function setup(overrides: Partial<typeof baseStore> = {}) {
  const store = { ...baseStore, ...overrides };
  mockUseWalletStore.mockReturnValue(store as any);
  return store;
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// AC-H1 – refreshWalletData called on mount
// ─────────────────────────────────────────────────────────────────────────────

describe('AC-H1 – refreshWalletData on mount', () => {
  it('calls refreshWalletData once when the screen mounts', () => {
    const store = setup();
    render(<HistoryScreen />);
    expect(store.refreshWalletData).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC-H2 – Transaction rows rendered
// ─────────────────────────────────────────────────────────────────────────────

describe('AC-H2 – transaction rows are rendered', () => {
  it('renders one row for each transaction', () => {
    setup({ transactions: [makeTx('tx1'), makeTx('tx2'), makeTx('tx3')] as any });
    const { getAllByText } = render(<HistoryScreen />);
    // Each TransactionListItem renders "Received XLM" or "Sent XLM".
    // With our fixture data (from !== publicKey) all are "Received XLM".
    expect(getAllByText('Received XLM')).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC-H3 – Empty state
// ─────────────────────────────────────────────────────────────────────────────

describe('AC-H3 – empty state', () => {
  it('shows the empty state when there are no transactions and not loading', () => {
    setup({ transactions: [], isLoading: false });
    const { getByTestId } = render(<HistoryScreen />);
    expect(getByTestId('empty-state')).toBeTruthy();
  });

  it('does not show the empty state while loading', () => {
    setup({ transactions: [], isLoading: true });
    const { queryByTestId } = render(<HistoryScreen />);
    expect(queryByTestId('empty-state')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC-H4 – Loading-more indicator
// ─────────────────────────────────────────────────────────────────────────────

describe('AC-H4 – loading-more indicator', () => {
  it('shows the loading indicator when isLoadingMore is true', () => {
    setup({
      transactions: [makeTx('tx1')] as any,
      isLoadingMore: true,
      hasMoreTransactions: true,
    });
    const { getByTestId } = render(<HistoryScreen />);
    expect(getByTestId('loading-more-indicator')).toBeTruthy();
  });

  it('does not show the loading indicator when isLoadingMore is false', () => {
    setup({
      transactions: [makeTx('tx1')] as any,
      isLoadingMore: false,
      hasMoreTransactions: true,
    });
    const { queryByTestId } = render(<HistoryScreen />);
    expect(queryByTestId('loading-more-indicator')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC-H5 – End-of-list indicator
// ─────────────────────────────────────────────────────────────────────────────

describe('AC-H5 – end-of-list indicator', () => {
  it('shows end-of-list text when hasMoreTransactions is false and list is non-empty', () => {
    setup({
      transactions: [makeTx('tx1')] as any,
      isLoadingMore: false,
      hasMoreTransactions: false,
    });
    const { getByTestId } = render(<HistoryScreen />);
    expect(getByTestId('end-of-list-indicator')).toBeTruthy();
  });

  it('does not show end-of-list text when transactions list is empty', () => {
    setup({
      transactions: [],
      isLoadingMore: false,
      hasMoreTransactions: false,
    });
    const { queryByTestId } = render(<HistoryScreen />);
    expect(queryByTestId('end-of-list-indicator')).toBeNull();
  });

  it('does not show end-of-list text while loading more', () => {
    setup({
      transactions: [makeTx('tx1')] as any,
      isLoadingMore: true,
      hasMoreTransactions: false,
    });
    const { queryByTestId } = render(<HistoryScreen />);
    // When isLoadingMore is true the loading indicator should show instead.
    expect(queryByTestId('end-of-list-indicator')).toBeNull();
    expect(queryByTestId('loading-more-indicator')).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC-H6 – No footer when more pages exist but not currently fetching
// ─────────────────────────────────────────────────────────────────────────────

describe('AC-H6 – no footer when more pages available and not loading', () => {
  it('renders neither footer indicator when hasMoreTransactions is true and not loading', () => {
    setup({
      transactions: [makeTx('tx1')] as any,
      isLoadingMore: false,
      hasMoreTransactions: true,
    });
    const { queryByTestId } = render(<HistoryScreen />);
    expect(queryByTestId('loading-more-indicator')).toBeNull();
    expect(queryByTestId('end-of-list-indicator')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AC-H7 – loadMoreTransactions called on end-reached
// ─────────────────────────────────────────────────────────────────────────────

describe('AC-H7 – loadMoreTransactions called on end-reached', () => {
  it('calls loadMoreTransactions when the FlatList fires onEndReached', () => {
    const store = setup({
      transactions: [makeTx('tx1'), makeTx('tx2')] as any,
      isLoadingMore: false,
      hasMoreTransactions: true,
    });

    const { UNSAFE_getByType } = render(<HistoryScreen />);
    const { FlatList } = require('react-native');
    const flatList = UNSAFE_getByType(FlatList);

    // Simulate the FlatList reaching its end.
    flatList.props.onEndReached();

    expect(store.loadMoreTransactions).toHaveBeenCalledTimes(1);
  });

  it('does not call loadMoreTransactions when hasMoreTransactions is false', () => {
    const store = setup({
      transactions: [makeTx('tx1')] as any,
      isLoadingMore: false,
      hasMoreTransactions: false,
    });

    const { UNSAFE_getByType } = render(<HistoryScreen />);
    const { FlatList } = require('react-native');
    const flatList = UNSAFE_getByType(FlatList);

    flatList.props.onEndReached();

    expect(store.loadMoreTransactions).not.toHaveBeenCalled();
  });

  it('does not call loadMoreTransactions when isLoadingMore is true', () => {
    const store = setup({
      transactions: [makeTx('tx1')] as any,
      isLoadingMore: true,
      hasMoreTransactions: true,
    });

    const { UNSAFE_getByType } = render(<HistoryScreen />);
    const { FlatList } = require('react-native');
    const flatList = UNSAFE_getByType(FlatList);

    flatList.props.onEndReached();

    expect(store.loadMoreTransactions).not.toHaveBeenCalled();
  });
});
