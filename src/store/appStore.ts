import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeAddress, isDuplicate, findDuplicate, duplicateMessage } from '../utils/address';

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
  addContact: (contact: Contact) => Promise<{ success: boolean; duplicateName?: string }>;
  updateContact: (id: string, name: string) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
  findContactByPublicKey: (publicKey: string) => Contact | undefined;
  toggleDarkMode: () => Promise<void>;
}

const STORAGE_KEYS = {
  CONTACTS: '@pocketpay_contacts',
  DARK_MODE: '@pocketpay_theme',
};

/**
 * @deprecated Use normalizeAddress from src/utils/address instead.
 * Kept for backward compatibility with existing callers.
 */
export function normalizePublicKey(publicKey: string): string {
  return normalizeAddress(publicKey);
}

const persistContacts = async (contacts: Contact[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  } catch (e) {
    console.error('Failed to save contacts:', e);
  }
};

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
    const { contacts } = get();
    const normalized = normalizeAddress(contact.publicKey);

    // Defense-in-depth: check for duplicates in the store as well.
    const existing = contacts.find(
      (c) => normalizeAddress(c.publicKey) === normalized,
    );
    if (existing) {
      return { success: false, duplicateName: existing.name };
    }

    // Also normalize the stored key so every entry in the list is consistent.
    const sanitized: Contact = {
      ...contact,
      publicKey: normalized,
      name: contact.name.trim(),
    };

    const newContacts = [...contacts, sanitized];
    set({ contacts: newContacts });
    await persistContacts(newContacts);
    return { success: true };
  },

  updateContact: async (id: string, name: string) => {
    const newContacts = get().contacts.map((c) =>
      c.id === id ? { ...c, name: name.trim() } : c,
    );
    set({ contacts: newContacts });
    await persistContacts(newContacts);
  },

  removeContact: async (id: string) => {
    const newContacts = get().contacts.filter(c => c.id !== id);
    set({ contacts: newContacts });
    await persistContacts(newContacts);
  },

  findContactByPublicKey: (publicKey: string) => {
    const normalized = normalizeAddress(publicKey);
    return get().contacts.find(
      (c) => normalizeAddress(c.publicKey) === normalized,
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
