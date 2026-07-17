import { create } from 'zustand';
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

interface VaultState {
  balance: string;
  isConfigured: boolean;
  contractId: string;
  isLoadingBalance: boolean;
  isSubmitting: boolean;
  balanceError: string | null;

  loadBalance: (publicKey: string) => Promise<void>;
  deposit: (secretKey: string, publicKey: string, amount: string) => Promise<string | null>;
  withdraw: (secretKey: string, publicKey: string, amount: string) => Promise<string | null>;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  balance: '0.0000000',
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
