import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mocks
jest.mock('../src/services/stellar');
jest.mock('../src/store/walletStore');
jest.mock('expo-router');
jest.mock('lucide-react-native', () => ({
  PiggyBank: () => null,
  ShieldCheck: () => null,
}));

import { mockFetchVaultBalance, mockDepositToVault, mockWithdrawFromVault } from '../src/services/stellar';
import { useWalletStore } from '../src/store/walletStore';
import VaultScreen from '../app/(tabs)/vault';

const mockUseWalletStore = useWalletStore as jest.MockedFunction<typeof useWalletStore>;
const mockFetchVaultBalanceFn = mockFetchVaultBalance as jest.MockedFunction<typeof mockFetchVaultBalance>;
const mockDepositToVaultFn = mockDepositToVault as jest.MockedFunction<typeof mockDepositToVault>;
const mockWithdrawFromVaultFn = mockWithdrawFromVault as jest.MockedFunction<typeof mockWithdrawFromVault>;

const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

function setupWalletStore(overrides = {}) {
  mockUseWalletStore.mockReturnValue({
    publicKey: 'GPUBLIC123',
    balance: '100.0000000',
    getSecretKey: jest.fn(async () => 'SSECRET123'),
    ...overrides,
  } as any);
}

describe('VaultScreen & Confirmation Modal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupWalletStore();
    mockFetchVaultBalanceFn.mockResolvedValue('50.0000000');
    mockDepositToVaultFn.mockResolvedValue(true);
    mockWithdrawFromVaultFn.mockResolvedValue(true);
  });

  it('renders vault balance and inputs correctly', async () => {
    const { getByText, getByPlaceholderText } = render(<VaultScreen />);
    
    await waitFor(() => {
      expect(mockFetchVaultBalanceFn).toHaveBeenCalledWith('GPUBLIC123');
    });
    
    expect(getByText('50.0000000 XLM')).toBeTruthy();
    expect(getByPlaceholderText('0.00')).toBeTruthy();
  });

  it('opens confirmation modal on deposit click and completes action on confirm', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<VaultScreen />);
    
    await waitFor(() => expect(mockFetchVaultBalanceFn).toHaveBeenCalled());
    
    const amountInput = getByPlaceholderText('0.00');
    fireEvent.changeText(amountInput, '10');
    
    fireEvent.press(getByText('Deposit'));
    
    // Modal should be visible now
    await waitFor(() => {
      expect(getByText('Confirm Deposit')).toBeTruthy();
    });
    
    expect(getByText('10 XLM')).toBeTruthy();
    
    // Confirm the action
    fireEvent.press(getByText('Deposit'));
    
    await waitFor(() => {
      expect(mockDepositToVaultFn).toHaveBeenCalledWith('SSECRET123', '10');
      expect(alertSpy).toHaveBeenCalledWith('Success', 'Funds deposited into Soroban Vault (Mock)');
    });
  });

  it('opens confirmation modal on withdraw click and completes action on confirm', async () => {
    const { getByPlaceholderText, getByText } = render(<VaultScreen />);
    
    await waitFor(() => expect(mockFetchVaultBalanceFn).toHaveBeenCalled());
    
    const amountInput = getByPlaceholderText('0.00');
    fireEvent.changeText(amountInput, '5');
    
    fireEvent.press(getByText('Withdraw'));
    
    // Modal should be visible now
    await waitFor(() => {
      expect(getByText('Confirm Withdrawal')).toBeTruthy();
    });
    
    expect(getByText('5 XLM')).toBeTruthy();
    
    // Confirm the action
    fireEvent.press(getByText('Withdraw'));
    
    await waitFor(() => {
      expect(mockWithdrawFromVaultFn).toHaveBeenCalledWith('SSECRET123', '5');
      expect(alertSpy).toHaveBeenCalledWith('Success', 'Funds withdrawn from Soroban Vault (Mock)');
    });
  });
});
