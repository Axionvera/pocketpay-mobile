import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Contact {
  id: string;
  name: string;
  publicKey: string;
}

interface AppState {
  contacts: Contact[];
  isDarkMode: boolean;
  isInitialized: boolean;

  // Actions
  initializeApp: () => Promise<void>;
  addContact: (contact: Contact) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
  findContactByPublicKey: (publicKey: string) => Contact | undefined;
  toggleDarkMode: () => Promise<void>;
}

const STORAGE_KEYS = {
  CONTACTS: '@pocketpay_contacts',
  DARK_MODE: '@pocketpay_theme',
};

export function normalizePublicKey(publicKey: string): string {
  return publicKey.trim().toUpperCase();
}

export const useAppStore = create<AppState>((set, get) => ({
  contacts: [],
  isDarkMode: true, // Default to a premium dark mode as suggested in plan
  isInitialized: false,

  initializeApp: async () => {
    try {
      const [storedContacts, storedTheme] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CONTACTS),
        AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE)
      ]);

      set({
        contacts: storedContacts ? JSON.parse(storedContacts) : [],
        isDarkMode: storedTheme ? JSON.parse(storedTheme) : true,
        isInitialized: true
      });
    } catch (e) {
      console.error('Failed to load app settings:', e);
      set({ isInitialized: true });
    }
  },

  addContact: async (contact: Contact) => {
    const newContacts = [...get().contacts, contact];
    set({ contacts: newContacts });
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(newContacts));
    } catch (e) {
      console.error('Failed to save contact:', e);
    }
  },

  removeContact: async (id: string) => {
    const newContacts = get().contacts.filter(c => c.id !== id);
    set({ contacts: newContacts });
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(newContacts));
    } catch (e) {
      console.error('Failed to remove contact:', e);
    }
  },

  findContactByPublicKey: (publicKey: string) => {
    const normalized = normalizePublicKey(publicKey);
    return get().contacts.find(
      (c) => normalizePublicKey(c.publicKey) === normalized,
    );
  },

  toggleDarkMode: async () => {
    const newMode = !get().isDarkMode;
    set({ isDarkMode: newMode });
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(newMode));
    } catch (e) {
      console.error('Failed to save theme setting:', e);
    }
  }
}));
