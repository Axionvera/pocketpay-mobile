declare module 'pocketpay-sdk' {
  export function validatePublicKey(key: string): void;
  export function importWallet(secretKey: string): { publicKey: string };
}
