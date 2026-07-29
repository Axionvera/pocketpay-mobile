# PocketPay Mobile Navigation and Feature Boundary Map

This is the contributor-facing map for PocketPay Mobile. Use it to determine:

1. which route and screen own a user flow;
2. which store, hook, or service owns its state;
3. which shared modules it depends on;
4. which navigation, persistence, and security boundaries require extra care.

The map describes the repository as it exists today. Where ownership overlaps or a boundary is incomplete, that condition is documented rather than presented as an architectural rule.

Related references:

- [Screen inventory](./screen-inventory.md)
- [Main wallet user flows](./user-flows.md)
- [Architecture readiness review](./architecture-readiness-review.md)
- [Storage guide](./storage.md)
- [Mobile wallet security FAQ](./WALLET_SECURITY_FAQ.md)
- [Vault integration assumptions](./vault-integration-assumptions.md)
- [Release testing checklist](./release-testing-checklist.md)

## 1. Navigation architecture

PocketPay uses Expo Router v6 file-based routing. `package.json` points to `expo-router/entry`.

| Tier | Layout | Navigator | Responsibility |
| --- | --- | --- | --- |
| Root shell | [`app/_layout.tsx`](../app/_layout.tsx) | `<Slot />` | Startup, wallet restoration, authentication redirects, global errors, app lock, and selected-route rendering |
| Authentication | [`app/(auth)/_layout.tsx`](../app/(auth)/_layout.tsx) | `<Stack>` | Wallet creation and import |
| Authenticated app | [`app/(tabs)/_layout.tsx`](../app/(tabs)/_layout.tsx) | `<Tabs>` | Home, Activity, Vault, Settings, and the shared network banner |

### Root-layout constraint

The root layout uses `<Slot />`; it does **not** declare a root `<Stack>`. Root-level routes therefore manage their own header and back behavior unless a nested navigator provides it.

Do not assume that `<Stack.Screen>` options inside a root-level screen configure navigation. There is no parent root stack to consume those options.

## 2. Startup, authentication, and global gates

[`app/_layout.tsx`](../app/_layout.tsx) performs this sequence:

```text
expo-router/entry
  -> import shim first
  -> install global exception and rejection handlers
  -> initialize app preferences
  -> restore the wallet
  -> wait for appStore.isInitialized and walletStore.walletChecked
  -> show secure-storage recovery UI when restoration fails
  -> redirect between (auth) and (tabs)
  -> wrap the selected route with ErrorBoundary and LockScreen
  -> render through <Slot />
```

The app must wait for both preference initialization and wallet restoration. Redirecting before `walletChecked` resolves can flash the onboarding flow for a returning user.

### Current authentication behavior

The root gate uses `router.replace`:

- wallet holders inside `(auth)` are sent to `/(tabs)`;
- users without a wallet are generally sent to `/(auth)`;
- `send`, `receive`, and `review-transaction` are hard-coded exceptions;
- a blocked deep link may be stored and replayed after authentication.

Route names are therefore coupled to authentication behavior. Adding, renaming, or moving a route may require changing the root gate.

## 3. Route inventory

The grouped `(auth)/index.tsx` and `(tabs)/index.tsx` both resolve to `/`. The root gate decides which is visible.

### 3.1 Authentication routes

| URL | Screen | Purpose | Main dependencies |
| --- | --- | --- | --- |
| `/` without a wallet | [`app/(auth)/index.tsx`](../app/(auth)/index.tsx) | Choose Create or Import | Router, theme, shared controls |
| `/create` | [`app/(auth)/create.tsx`](../app/(auth)/create.tsx) | Generate a Testnet keypair, reveal the secret, persist it, and require backup acknowledgement | `walletStore`, Stellar service, secure-storage error handling |
| `/import` | [`app/(auth)/import.tsx`](../app/(auth)/import.tsx) | Validate and import a Stellar secret seed | `walletStore`, Stellar `StrKey`, `pocketpay-sdk` |
| `/wallet-creation-success` | [`app/(auth)/wallet-creation-success.tsx`](../app/(auth)/wallet-creation-success.tsx) | Confirm creation and replace navigation with the tabs | Router and shared action button |

New pre-wallet routes belong under `app/(auth)/` and must also be declared in [`app/(auth)/_layout.tsx`](../app/(auth)/_layout.tsx).

### 3.2 Authenticated tabs

| URL | Screen | Tab | Purpose | Primary state owner |
| --- | --- | --- | --- | --- |
| `/` with a wallet | [`app/(tabs)/index.tsx`](../app/(tabs)/index.tsx) | Home | Balance, funding, backup reminder, recent activity | `walletStore` |
| `/history` | [`app/(tabs)/history.tsx`](../app/(tabs)/history.tsx) | Activity | Filtered and paginated transactions | `walletStore` |
| `/vault` | [`app/(tabs)/vault.tsx`](../app/(tabs)/vault.tsx) | Vault | Balance, deposits, withdrawals, and time locks | `vaultStore` and vault feature hooks |
| `/settings` | [`app/(tabs)/settings.tsx`](../app/(tabs)/settings.tsx) | Settings | Theme, app lock, wallet actions, contacts, network details, diagnostics | Multiple owning stores |

The tab layout adds `NetworkStateBanner`. Root-level routes do not inherit it automatically.

### 3.3 Root-level routes

These routes are rendered through the root `<Slot />`.

| URL | Screen | Purpose | Navigation |
| --- | --- | --- | --- |
| `/send` | [`app/send.tsx`](../app/send.tsx) | Validate payment details, choose/create a contact, or scan a recipient | Pushes `/sign-confirmation` |
| `/sign-confirmation` | [`app/sign-confirmation.tsx`](../app/sign-confirmation.tsx) | Final warning and transaction summary before execution | Pushes `/review-transaction`; cancellation replaces with tabs |
| `/review-transaction` | [`app/review-transaction.tsx`](../app/review-transaction.tsx) | Sign, submit, track phases, retry, and report completion | Replaces with `/payment-success` |
| `/payment-success` | [`app/payment-success.tsx`](../app/payment-success.tsx) | Show the result and explorer information | Replaces with `/(tabs)` |
| `/receive` | [`app/receive.tsx`](../app/receive.tsx) | Display and share the receive address and QR payload | Entered from Home |
| `/scan` | [`app/scan.tsx`](../app/scan.tsx) | Full-screen QR scanner with manual-entry fallback | Replaces with `/send?destination=...` |
| `/contacts` | [`app/contacts.tsx`](../app/contacts.tsx) | Add, scan, update, and remove contacts | Entered from Settings |
| `/diagnostics` | [`app/diagnostics.tsx`](../app/diagnostics.tsx) | Show redacted diagnostics and environment information | Entered from Settings |
| `/transaction/:id` | [`app/transaction/[id].tsx`](../app/transaction/[id].tsx) | Render or fetch one transaction | Home, Activity, or deep link |
| `/vault/:id` | [`app/vault/[id].tsx`](../app/vault/[id].tsx) | Vault detail/placeholder route | Vault or deep link |
| `/vault-lock/:id` | [`app/vault-lock/[id].tsx`](../app/vault-lock/[id].tsx) | Time-lock detail and mature-withdraw state | Vault list or deep link |

### Route cautions

- `/scan` and the scanner embedded in `/send` are separate implementations.
- The root scanner sets a `destination` query parameter; verify that Send consumes it before relying on that handoff.
- Root-level screens use multiple header conventions.
- There is no `app/+not-found.tsx`; unmatched deep links have no app-specific route.

## 4. Primary flows

### Wallet creation

```text
(auth) landing
  -> /create
  -> generate keypair
  -> reveal and confirm backup
  -> walletStore.setWallet() stores the secret in SecureStore
  -> walletStore.markBackupPending()
  -> /wallet-creation-success
  -> replace with /(tabs)
```

### Wallet import

```text
(auth) landing
  -> /import
  -> validate secret seed
  -> pocketpay-sdk importWallet()
  -> walletStore.setWallet()
  -> success state
  -> replace with /(tabs)
```

### Send and signing

```text
Home or payment entry
  -> /send
  -> validate address, amount, memo, balance, funding, and network state
  -> /sign-confirmation
  -> explicit user approval
  -> /review-transaction
  -> signerStore: review -> handoff -> signing -> submitting -> confirming
  -> completed or failed
  -> optimistic transaction added to walletStore
  -> replace with /payment-success
  -> replace with /(tabs)
```

Using `replace` after completion is intentional: it prevents back-navigation into a stale signing flow.

### Receive and scanning

```text
Home -> /receive -> render/copy/share receive payload
Home -> /scan -> QR result -> replace with /send?destination=...
/send -> embedded QrScanner -> write address directly into form state
```

### Activity detail

```text
Home recent row or Activity row
  -> /transaction/:id
  -> use walletStore data when present
  -> fetch from Horizon when absent
  -> render loading, detail, not-found, or retry state
```

### Vault

```text
Vault tab
  -> load availability, balance, and locks
  -> deposit/withdraw/lock orchestration
  -> /vault/:id
  -> /vault-lock/:id
```

The vault may be mock-backed or use a configured Soroban integration. A UI success state must not be documented as confirmed settlement without checking the active configuration and confirmation path.

## 5. Feature ownership

This table describes current ownership, not an ideal future folder structure.

| Feature | Screen ownership | State/orchestration | Services and deep dependencies |
| --- | --- | --- | --- |
| Wallet lifecycle | Create, Import, wallet section in Settings | `src/store/walletStore.ts` | `src/services/stellar.ts`, `pocketpay-sdk`, SecureStore, AsyncStorage backup acknowledgement |
| Balance and funding | Home, Send warnings, Activity | `walletStore` | Horizon and Friendbot helpers |
| Transactions | Home preview, Activity, transaction detail | `walletStore`, transaction feature/util modules | Horizon access in Stellar service |
| Send and signing | Send, Sign Confirmation, Review Transaction, Payment Success | `walletStore`, `signerStore`, and screen orchestration | Stellar service, wallet secret, contact labels |
| Receive and QR | Receive, Scan, Send/Contacts scanner surfaces | Mostly local screen/component state | Expo Camera, `QrScanner`, QR rendering library |
| Contacts | Contacts screen and Send contact UI | `appStore` for Contacts; `contactStore` for parts of Send | AsyncStorage, validation and normalization |
| Vault | Vault tab and dynamic vault routes | `vaultStore`, `src/features/vault/`, vault hooks | Vault/Stellar services, wallet secret, Soroban configuration |
| Settings/theme | Settings | `appStore` plus feature-specific stores | AsyncStorage, environment configuration |
| App lock/security | Root LockScreen and Settings | `appLockStore`, `walletStore` | Local Authentication, SecureStore, reset UI |
| Diagnostics/errors | Root recovery UI and Diagnostics | ErrorBoundary, global error handler, reporting utilities | Redaction and environment metadata |

## 6. Store and persistence boundaries

| Store | Owns | Cross-feature consumers |
| --- | --- | --- |
| `walletStore` | Public key, secret access, balance, funding, transactions, wallet reset, backup reminder | Root, auth, Home, Activity, Send, signing, Receive, Vault, Settings |
| `appStore` | Theme, app initialization, one contacts collection | Root, theme, Contacts, Send labels, Settings |
| `signerStore` | Transaction review/signing phase machine | Review Transaction and payment completion |
| `vaultStore` | Vault config, balance, locks, action state | Vault routes and Settings reset paths |
| `appLockStore` | Lock preference and biometric authentication | Root LockScreen and Settings |
| `contactStore` | A second contacts collection and recent recipients | Send feature |

### Persistence map

| Data | Storage | Owner | Caution |
| --- | --- | --- | --- |
| Wallet secret | SecureStore | `walletStore` | Never move into AsyncStorage, route params, logs, diagnostics, screenshots, or persisted Zustand state |
| Wallet runtime data | Memory and network refresh | `walletStore` | A public key alone does not prove secret restoration succeeded |
| Backup acknowledgement | AsyncStorage | `walletStore` | Must survive restarts until acknowledged |
| Theme and `appStore` contacts | AsyncStorage | `appStore` | Parse stored values defensively |
| Feature contacts and recent recipients | Persisted Zustand/AsyncStorage | `contactStore` | Separate from `appStore.contacts` |
| Vault state | Store/service-specific persistence | `vaultStore` and vault utilities | Treat local financial-looking state as cache/placeholder unless contract-confirmed |

### Duplicate contacts boundary

There are currently two contacts sources:

1. `appStore.contacts`, used by the main Contacts screen and payment label resolution;
2. `contactStore.contacts`, used by Send for embedded contact creation and recent recipients.

Updating one does not update the other. Do not introduce a third source. Any contact-related change must identify which store is authoritative for that flow and account for migration or consolidation when crossing the boundary.

## 7. Shared components

Shared UI lives under `src/components/`.

| Category | Examples | Boundary |
| --- | --- | --- |
| Navigation/chrome | `ScreenHeader`, `NetworkStateBanner`, `OfflineBanner` | Route decisions remain in layouts/screens |
| Actions/forms | `Button`, `AsyncActionButton`, `FormField`, `Input`, `ConfirmModal`, `DirtyFormConfirm` | Service calls and validation remain with the owner |
| States/status | `LoadingState`, `EmptyState`, `WalletEmptyState`, `StatusBadge`, `FundingStatusBanner` | Preserve consistent loading, error, and accessibility behavior |
| Security/recovery | `LockScreen`, `SecretKeyReveal`, `WalletResetConfirmModal`, `BackupReminderModal` | Do not weaken authentication, masking, or destructive confirmation |
| Payments/contacts | `ReviewConfirm`, `QrScanner`, `ContactPicker`, `ContactForm`, `PaymentErrorBanner` | Keep signing and persistence outside presentation components |
| Vault | Vault modals, lists, details, and unavailable state | Shared UI must not decide whether data is mock or contract-confirmed |

Preferred dependency direction:

```text
screen/layout -> feature hook or store action -> service/SDK
screen/layout -> shared component through props
```

This is a target boundary, not a fully enforced rule; some screens currently import services directly.

## 8. Cross-feature dependencies

```text
Root shell
  -> appStore initialization
  -> walletStore restoration
  -> appLockStore through LockScreen
  -> ErrorBoundary and globalErrorHandler

Wallet/transactions
  -> walletStore
  -> services/stellar
  -> SecureStore and Horizon/Friendbot

Payment
  -> walletStore
  -> signerStore
  -> appStore contacts for labels
  -> contactStore for Send contacts/recent recipients
  -> services/stellar

Vault
  -> walletStore identity/secret access
  -> vaultStore
  -> vault feature hooks
  -> vault service or mock fallback
  -> Soroban configuration

Settings
  -> appStore
  -> appLockStore
  -> walletStore
  -> vaultStore
  -> Contacts and Diagnostics routes
```

Changes to `walletStore`, `services/stellar.ts`, root auth logic, or storage utilities require regression checks across several features.

## 9. Global error and recovery boundaries

| Layer | Owner | Handles |
| --- | --- | --- |
| Render boundary | `ErrorBoundary` | React render/lifecycle errors |
| Global JS handler | `globalErrorHandler.ts` | Exceptions outside render boundaries |
| Rejection tracking | `globalErrorHandler.ts` | Unhandled promises |
| Reporting/redaction | Error reporting and diagnostics utilities | Safe metadata without secrets |
| Wallet recovery | Root layout | SecureStore failure, retry, destructive reset |
| Network state | Tab layout and selected root screens | Offline/degraded state and write disabling |
| Feature recovery | Owning screen/store/hook | Validation, submission, vault, contact, transaction errors |

Global handlers report and then preserve the platform’s default crash/RedBox behavior. They must not silently swallow fatal errors.

## 10. High-risk caution zones

### Secret access

- `walletStore.getSecretKey()` crosses the app’s most sensitive boundary.
- Never pass secrets through routes, AsyncStorage, logs, analytics, diagnostics, screenshots, or user-visible errors.
- Preserve confirmation and clear failure states for export/reset operations.

### Polyfill order

The root imports `shim` first for Stellar and cryptographic dependencies. Do not move it below other imports or import the Stellar SDK from an earlier startup module.

### Auth and deep links

- Route names are coupled to the root allowlist.
- Deep links can arrive before initialization completes.
- Validate dynamic parameters before network access.
- `push`, `replace`, and `back` are security and duplicate-action concerns, not cosmetic choices.

### Payments

- Scanning or choosing a contact must never sign automatically.
- Signing requires explicit confirmation.
- Client timeout does not prove network rejection.
- Success must remove stale signing screens from back navigation.

### Contacts

- Two persisted stores overlap.
- Normalize addresses and preserve duplicate checks.
- Contact names are labels; the Stellar address remains authoritative.

### Vault

- Confirm mock versus contract-backed mode.
- Do not infer finality from submission alone.
- Lock IDs, maturity calculations, and local persistence require tests.

### Diagnostics

- Keep diagnostics read-only and redacted.
- Never expose secret seeds, authorization material, or raw storage.
- Keep synthetic errors separate from normal user flows.

## 11. Contributor checklist

For a route change:

1. Update the route file and grouped navigator when applicable.
2. Check root auth and deep-link replay.
3. Decide whether the route needs network-state UI.
4. Preserve intentional `push`, `replace`, or `back`.
5. Validate route parameters.
6. Identify the owning store and avoid duplicate state.
7. Preserve secret and persistence boundaries.
8. Reuse shared components and UI-state patterns.
9. Update tests and the release checklist.
10. Update this map when ownership or navigation changes.

For a shared store/service change:

1. Search all consumers.
2. Check cold start and restoration.
3. Test empty, loading, error, retry, and offline states.
4. Check direct navigation and deep links.
5. Verify persistence and malformed stored data.
6. Confirm logs and diagnostics remain redacted.

## 12. Quick ownership finder

| Change | Start here | Also inspect |
| --- | --- | --- |
| Add pre-wallet screen | `app/(auth)/`, auth layout | Root redirect/startup |
| Add bottom tab | `app/(tabs)/`, tab layout | Network banner and auth redirect |
| Add root route | New `app/` file | Root `<Slot />`, header/back, auth allowlist, deep links |
| Change wallet creation/import | Auth screens, `walletStore` | SecureStore, backup and recovery |
| Change balance/Activity | `walletStore`, Home, History | Horizon, pagination, pending transactions |
| Change Send/signing | Send, Sign Confirmation, Review, `signerStore` | Secret access, contacts, network, success replacement |
| Change Receive/QR | Receive, Scan, `QrScanner` | QR docs, permission states, query handling |
| Change contacts | Contacts, `appStore`, `contactStore` | Normalization and Send picker |
| Change vault | Vault screens, `vaultStore`, vault feature | Service, mock/live config, wallet secret |
| Change Settings | Settings and owning stores | Reset, app lock, theme, diagnostics |
| Change global errors | Root, ErrorBoundary, global handler | Redaction and platform handler |

Keep this document synchronized with the route tree. It maps current ownership and risk; it does not replace reading the code being changed.
