import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Contact } from '@/types/contacts';

interface ContactStore {
  contacts: Contact[];
  recentRecipients: string[];
  addContact: (name: string, address: string) => Contact;
  updateContact: (id: string, name: string, address: string) => void;
  deleteContact: (id: string) => void;
  addRecentRecipient: (address: string) => void;
  getContactByAddress: (address: string) => Contact | undefined;
}

export const useContactStore = create<ContactStore>()(
  persist(
    (set, get) => ({
      contacts: [],
      recentRecipients: [],

      addContact: (name: string, address: string) => {
        const newContact: Contact = {
          id: Date.now().toString(),
          name: name.trim(),
          address: address.trim(),
          createdAt: Date.now(),
        };
        set((state) => ({
          contacts: [...state.contacts, newContact],
        }));
        return newContact;
      },

      updateContact: (id: string, name: string, address: string) => {
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === id ? { ...c, name: name.trim(), address: address.trim() } : c
          ),
        }));
      },

      deleteContact: (id: string) => {
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        }));
      },

      addRecentRecipient: (address: string) => {
        set((state) => {
          const filtered = state.recentRecipients.filter((a) => a !== address);
          const updated = [address, ...filtered].slice(0, 10);
          return { recentRecipients: updated };
        });
      },

      getContactByAddress: (address: string) => {
        return get().contacts.find((c) => c.address === address);
      },
    }),
    {
      name: 'contact-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
