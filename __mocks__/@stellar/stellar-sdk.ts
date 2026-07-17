// Jest mock for @stellar/stellar-sdk
// Prevents the real SDK from being loaded in the test environment,
// which would fail due to missing browser/Node stream APIs.

const mockKeypair = {
  fromSecret: jest.fn((secret: string) => ({
    publicKey: jest.fn(() => 'GAMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCK'),
    secret: jest.fn(() => secret),
  })),
  fromRawEd25519Seed: jest.fn((seed: Uint8Array) => ({
    publicKey: jest.fn(() => 'GAMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCK'),
    secret: jest.fn(() => 'SAMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCK'),
  })),
  random: jest.fn(() => ({
    publicKey: jest.fn(() => 'GAMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCK'),
    secret: jest.fn(() => 'SAMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCK'),
  })),
};

const mockHorizon = {
  Server: jest.fn().mockImplementation(() => ({
    loadAccount: jest.fn(),
    fetchBaseFee: jest.fn(),
    submitTransaction: jest.fn(),
    operations: jest.fn().mockReturnValue({
      forAccount: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            call: jest.fn().mockResolvedValue({ records: [] }),
            cursor: jest.fn().mockReturnThis(),
          }),
        }),
      }),
    }),
  })),
};

export const Keypair = mockKeypair;
export const Horizon = mockHorizon;
export const Networks = { TESTNET: 'Test SDF Network ; September 2015', PUBLIC: 'Public Global Stellar Network ; September 2015' };
export const TransactionBuilder = jest.fn().mockImplementation(() => ({
  addOperation: jest.fn().mockReturnThis(),
  addMemo: jest.fn().mockReturnThis(),
  setTimeout: jest.fn().mockReturnThis(),
  build: jest.fn().mockReturnValue({
    sign: jest.fn(),
  }),
}));
export const Operation = {
  payment: jest.fn((opts: any) => opts),
};
export const Asset = {
  native: jest.fn(() => 'native'),
};
export const Memo = {
  text: jest.fn((text: string) => text),
};
