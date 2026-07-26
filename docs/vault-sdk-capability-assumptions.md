# Vault SDK Capability Assumptions

This document describes the assumptions the vault unavailable state makes about PocketPay SDK and Soroban contract readiness.

## Current Capability Checks

| Check                | Source                         | Fallback                          |
|----------------------|--------------------------------|-----------------------------------|
| Wallet loaded        | `walletStore.publicKey`        | Show "no wallet" unavailable      |
| Feature flag         | `EXPO_PUBLIC_VAULT_ENABLED`    | Default `true` (vault enabled)    |
| Contract configured  | `isVaultConfigured()`          | Mock mode (not unavailable)       |

## Future SDK Capability Signal

When the PocketPay SDK (`pocketpay-sdk`) ships a vault readiness API, the mobile client should:

1. Call `sdk.vault.isReady()` (or equivalent) during app initialization.
2. Store the result in `vaultStore` or a dedicated capability store.
3. Pass it to `evaluateVaultAvailability()` as a new input.
4. Add `'sdk-not-ready'` to the reasons array when the SDK reports the vault backend is not available.

### Expected SDK Interface

```typescript
interface PocketPaySDK {
  vault: {
    /** Returns true when the vault contract is deployed and reachable. */
    isReady(): Promise<boolean>;
    /** Returns the set of vault features currently available. */
    getCapabilities(): Promise<VaultCapabilities>;
  };
}

interface VaultCapabilities {
  deposit: boolean;
  withdraw: boolean;
  lock: boolean;
  unlock: boolean;
}
```

Until this interface is available, the mobile client uses `isVaultConfigured()` (env-var check) as a proxy.

## Related Documentation

- [Vault Integration Assumptions](./vault-integration-assumptions.md)
- [Vault Integration Risks](./vault-integration-risks.md)
- [Vault UI Guidance](./vault-ui-guidance.md)
