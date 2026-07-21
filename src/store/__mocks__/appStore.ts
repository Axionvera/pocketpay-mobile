// Manual mock for useAppStore – provides controllable defaults.
// Individual tests can call (useAppStore as jest.Mock).mockReturnValue({...})
// to override per-test.

const defaultState = {
  contacts: [],
  themeMode: "dark",
  isInitialized: true,
  initializeApp: jest.fn(async () => {}),
  addContact: jest.fn(async () => {}),
  removeContact: jest.fn(async () => {}),
  findContactByPublicKey: jest.fn(() => undefined),
  findContactByName: jest.fn(() => undefined),
  setThemeMode: jest.fn(async () => {}),
};

export const useAppStore = jest.fn(
  (selector?: (state: typeof defaultState) => unknown) =>
    selector ? selector(defaultState) : defaultState,
);
