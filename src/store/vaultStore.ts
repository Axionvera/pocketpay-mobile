import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isVaultConfigured,
  getVaultContractId,
  getVaultBalance,
  depositToVault,
  withdrawFromVault,
} from '../services/vault';
import {
  mockFetchVaultBalance,
  mockDepositToVault,
  mockWithdrawFromVault,
} from '../services/stellar';

const LOCKED_BALANCE_KEY = '@pocketpay_vault_locked_balance';
const UNLOCK_TIME_KEY = '@pocketpay_vault_unlock_time';

interface VaultState {
  balance: string;
  lockedBalance: string;
  unlockTime: string | null;
  isConfigured: boolean;
  contractId: string;
  isLoadingBalance: boolean;
  isSubmitting: boolean;
  balanceError: string | null;

  loadBalance: (publicKey: string) => Promise<void>;
  loadLockedState: () => Promise<void>;
  lockFunds: (amount: string, unlockTime: string) => Promise<void>;
  deposit: (secretKey: string, publicKey: string, amount: string) => Promise<string | null>;
  withdraw: (secretKey: string, publicKey: string, amount: string) => Promise<string | null>;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  balance: '0.0000000',
  lockedBalance: '0.0000000',
  unlockTime: null,
  isConfigured: isVaultConfigured(),
  contractId: getVaultContractId(),
  isLoadingBalance: false,
  isSubmitting: false,
  balanceError: null,

  loadBalance: async (publicKey: string) => {
    set({ isLoadingBalance: true, balanceError: null });
    try {
      const balance = get().isConfigured
        ? await getVaultBalance(publicKey)
        : await mockFetchVaultBalance(publicKey);
      set({ balance, isLoadingBalance: false });
    } catch (err: any) {
      set({
        isLoadingBalance: false,
        balanceError: err.message || 'Failed to load vault balance',
      });
    }
  },

  loadLockedState: async () => {
    try {
      const [lockedBalance, unlockTime] = await Promise.all([
        AsyncStorage.getItem(LOCKED_BALANCE_KEY),
        AsyncStorage.getItem(UNLOCK_TIME_KEY),
      ]);
      set({
        lockedBalance: lockedBalance ?? '0.0000000',
        unlockTime: unlockTime,
      });
    } catch (err: any) {
      console.error('Failed to load locked state:', err);
    }
  },

  lockFunds: async (amount: string, unlockTime: string) => {
    set({ isSubmitting: true });
    try {
      await Promise.all([
        AsyncStorage.setItem(LOCKED_BALANCE_KEY, amount),
        AsyncStorage.setItem(UNLOCK_TIME_KEY, unlockTime),
      ]);
      set({ lockedBalance: amount, unlockTime });
    } finally {
      set({ isSubmitting: false });
    }
  },

  // Returns the transaction hash on-chain, or null in mock mode.
  deposit: async (secretKey: string, publicKey: string, amount: string) => {
    set({ isSubmitting: true });
    try {
      let hash: string | null = null;
      if (get().isConfigured) {
        hash = await depositToVault(secretKey, amount);
      } else {
        await mockDepositToVault(secretKey, amount);
      }
      await get().loadBalance(publicKey);
      return hash;
    } finally {
      set({ isSubmitting: false });
    }
  },

  withdraw: async (secretKey: string, publicKey: string, amount: string) => {
    set({ isSubmitting: true });
    try {
      let hash: string | null = null;
      if (get().isConfigured) {
        hash = await withdrawFromVault(secretKey, amount);
      } else {
        await mockWithdrawFromVault(secretKey, amount);
      }
      await get().loadBalance(publicKey);
      return hash;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
