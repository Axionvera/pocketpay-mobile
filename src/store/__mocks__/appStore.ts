// Manual mock for useAppStore – provides controllable defaults.
// Individual tests can call (useAppStore as jest.Mock).mockReturnValue({...})
// to override per-test.

const defaultState = {
  contacts: [],
  isDarkMode: true,
  isInitialized: true,
  initializeApp: jest.fn(async () => {}),
  addContact: jest.fn(async () => {}),
  removeContact: jest.fn(async () => {}),
  toggleDarkMode: jest.fn(async () => {}),
};

export const useAppStore = jest.fn(() => defaultState);
