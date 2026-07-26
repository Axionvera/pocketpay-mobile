# Mobile Security Checklist

This checklist should be reviewed by contributors when making changes that affect security-sensitive parts of the PocketPay mobile app.

## Secret Handling
- [ ] Ensure secret keys (`S…`) are never logged or printed to console.
- [ ] Verify that any new code handling keys reads from `expo-secure-store` and does not persist them to `AsyncStorage` or the filesystem.
- [ ] If exposing a secret for debugging, guard with `if (__DEV__)` and ensure it is removed before production.

## Signing Flows
- [ ] Confirm that transaction signing occurs via the `Signer` abstraction and that the secret never leaves SecureStore.
- [ ] When adding new signing pathways, ensure they respect the existing `Signer` interface and do not introduce direct key usage.
- [ ] Validate that any external signer integration follows the documented handoff design.

## Logging & Diagnostics
- [ ] Audit new log statements to ensure no sensitive data (secret keys, mnemonics, seed phrases) are included.
- [ ] Use `console.log` for non-sensitive debugging only under `__DEV__` guards.
- [ ] Remove or mask error objects that may contain request parameters or private data before logging.

## Screenshots & Clipboard
- [ ] Avoid displaying secret keys or QR codes containing private information on-screen in screenshots.
- [ ] Verify that any UI that copies public keys to the clipboard includes a warning about clipboard privacy.
- [ ] Ensure test screenshots used in documentation do not contain real secret keys.

## Secure Storage
- [ ] Ensure all stored secrets use `expo-secure-store` (Keychain on iOS, Android Keystore on Android).
- [ ] Do not fallback to `AsyncStorage` for any secret material.
- [ ] Add error handling for SecureStore read/write failures without auto‑deleting keys.

## Error & Recovery Flows
- [ ] Confirm that storage errors surface appropriate user‑friendly messages and do not purge the secret key.
- [ ] Verify that any reset flow clearly warns users about key loss and requires manual backup confirmation.
- [ ] Ensure that error boundaries do not expose stack traces or internal details in production.

## Diagnostics & Telemetry
- [ ] If adding analytics or telemetry, exclude any fields that could contain secret keys or personal identifiers.
- [ ] Review that any performance logs respect privacy guidelines.

## Peer Review Checklist
- [ ] All above items have been checked for the modified code.
- [ ] Documentation updated to reflect any new security-relevant behavior.
- [ ] Tests added/updated to cover security-critical paths.

---

*This checklist is intended to maintain the high security standards of PocketPay on the Stellar Testnet.*
