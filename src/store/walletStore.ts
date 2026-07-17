import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { fetchXlmBalance, fetchRecentTransactions, fundWithFriendbot } from '../services/stellar';

const WALLET_KEY = 'pocketpay_wallet_secret';

export interface TransactionRecord {
  id: string;
  type: string;
  created_at: string;
  source_account?: string;
  to?: string;
  from?: string;
  amount?: string;
  asset_type?: string;
}

interface WalletState {
  publicKey: string | null;
  balance: string;
  transactions: TransactionRecord[];
  isLoading: boolean;
  isFunding: boolean;
  fundError: string | null;
  error: string | null;
  
  // Actions
  setWallet: (publicKey: string, secretKey: string) => Promise<void>;
  loadWalletFromStorage: () => Promise<boolean>;
  refreshWalletData: () => Promise<void>;
  clearWallet: () => Promise<void>;
  getSecretKey: () => Promise<string | null>;
  fundWallet: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  publicKey: null,
  balance: '0.0000000',
  transactions: [],
  isLoading: false,
  isFunding: false,
  fundError: null,
  error: null,

  setWallet: async (publicKey: string, secretKey: string) => {
    try {
      await SecureStore.setItemAsync(WALLET_KEY, secretKey);
      set({ publicKey, balance: '0.0000000', transactions: [], error: null });
    } catch (err) {
      console.error('Failed to save wallet securely:', err);
      set({ error: 'Failed to save wallet securely' });
    }
  },

  loadWalletFromStorage: async () => {
    try {
      const secretKey = await SecureStore.getItemAsync(WALLET_KEY);
      if (secretKey) {
        // Derive public key from secret to ensure consistency without storing it separately
        // Or we could have stored publicKey in AsyncStorage. For simplicity, we just
        // derive it if we only have the secret. We need to import StellarSdk here or in service.
        // To avoid circular dependencies, we'll do it simply here via dynamic import or pass from UI
        // Actually, importing StellarSdk here is fine.
        const StellarSdk = await import('@stellar/stellar-sdk');
        const keypair = StellarSdk.Keypair.fromSecret(secretKey);
        set({ publicKey: keypair.publicKey() });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to load wallet from storage:', err);
      return false;
    }
  },

  refreshWalletData: async () => {
    const { publicKey } = get();
    if (!publicKey) return;

    set({ isLoading: true, error: null });
    try {
      const [balance, txs] = await Promise.all([
        fetchXlmBalance(publicKey),
        fetchRecentTransactions(publicKey),
      ]);
      set({ balance, transactions: txs as any, isLoading: false });
    } catch (err: any) {
      console.error('Failed to refresh wallet data:', err);
      set({ isLoading: false, error: err.message || 'Failed to sync data' });
    }
  },

  clearWallet: async () => {
    try {
      await SecureStore.deleteItemAsync(WALLET_KEY);
      set({ publicKey: null, balance: '0.0000000', transactions: [], error: null });
    } catch (err) {
      console.error('Failed to clear wallet:', err);
    }
  },

  getSecretKey: async () => {
    try {
      return await SecureStore.getItemAsync(WALLET_KEY);
    } catch (err) {
      console.error('Failed to get secret key:', err);
      return null;
    }
  },

  fundWallet: async () => {
    const { publicKey } = get();
    if (!publicKey) return;

    set({ isFunding: true, fundError: null });
    try {
      await fundWithFriendbot(publicKey);
      // Refresh balance after successful funding
      await get().refreshWalletData();
      set({ isFunding: false });
    } catch (err: any) {
      console.error('Friendbot funding failed:', err);
      set({ isFunding: false, fundError: err.message || 'Funding failed. Please try again.' });
    }
  }
}));
