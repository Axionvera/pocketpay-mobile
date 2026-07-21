import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Contact {
  id: string;
  name: string;
  publicKey: string;
}

export type ThemeMode = "light" | "dark" | "system";

const VALID_THEME_MODES: ThemeMode[] = ["light", "dark", "system"];

export function isValidThemeMode(value: unknown): value is ThemeMode {
  return (
    typeof value === "string" && VALID_THEME_MODES.includes(value as ThemeMode)
  );
}

const DEFAULT_THEME_MODE: ThemeMode = "dark";

interface AppState {
  contacts: Contact[];
  themeMode: ThemeMode;
  isInitialized: boolean;

  // Actions
  initializeApp: () => Promise<void>;
  addContact: (contact: Contact) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
  findContactByPublicKey: (publicKey: string) => Contact | undefined;
  findContactByName: (name: string) => Contact | undefined;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const STORAGE_KEYS = {
  CONTACTS: "@pocketpay_contacts",
  THEME_MODE: "@pocketpay_theme",
};

export function normalizePublicKey(publicKey: string): string {
  return publicKey.trim().toUpperCase();
}

/** Parses a stored theme preference, falling back safely if it is missing, malformed, or not a recognized mode. */
function parseStoredThemeMode(stored: string | null): ThemeMode {
  if (!stored) return DEFAULT_THEME_MODE;
  try {
    const parsed = JSON.parse(stored);
    return isValidThemeMode(parsed) ? parsed : DEFAULT_THEME_MODE;
  } catch {
    return DEFAULT_THEME_MODE;
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  contacts: [],
  themeMode: DEFAULT_THEME_MODE,
  isInitialized: false,

  initializeApp: async () => {
    try {
      const [storedContacts, storedTheme] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CONTACTS),
        AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE),
      ]);

      set({
        contacts: storedContacts ? JSON.parse(storedContacts) : [],
        themeMode: parseStoredThemeMode(storedTheme),
        isInitialized: true,
      });
    } catch (e) {
      console.error("Failed to load app settings:", e);
      set({ isInitialized: true });
    }
  },

  addContact: async (contact: Contact) => {
    const newContacts = [...get().contacts, contact];
    set({ contacts: newContacts });
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CONTACTS,
        JSON.stringify(newContacts),
      );
    } catch (e) {
      console.error("Failed to save contact:", e);
    }
  },

  removeContact: async (id: string) => {
    const newContacts = get().contacts.filter((c) => c.id !== id);
    set({ contacts: newContacts });
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CONTACTS,
        JSON.stringify(newContacts),
      );
    } catch (e) {
      console.error("Failed to remove contact:", e);
    }
  },

  findContactByPublicKey: (publicKey: string) => {
    const normalized = normalizePublicKey(publicKey);
    return get().contacts.find(
      (c) => normalizePublicKey(c.publicKey) === normalized,
    );
  },

  findContactByName: (name: string) => {
    const normalized = name.trim().toLowerCase();
    return get().contacts.find(
      (c) => c.name.trim().toLowerCase() === normalized,
    );
  },

  setThemeMode: async (mode: ThemeMode) => {
    if (!isValidThemeMode(mode)) return;
    set({ themeMode: mode });
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, JSON.stringify(mode));
    } catch (e) {
      console.error("Failed to save theme setting:", e);
    }
  },
}));
