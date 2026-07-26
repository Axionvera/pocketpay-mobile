# PocketPay Mobile — Release Testing Checklist

Run this checklist before any tagged release build (staging or production). Each box represents a manual verification step performed on a real device or simulator using the exact bundle that will ship.

- **Tester:** ____________________________
- **Release version:** (e.g. 1.4.0) ______
- **Build / commit hash:** __________________
- **Date tested:** ____ / ____ / _________
- **Final result:** &nbsp; ✅ PASS &nbsp; / &nbsp; ⚠️ PASS WITH NOTES &nbsp; / &nbsp; ❌ FAIL

---

## 0. Pre-Test Setup & Build Verification

Run these steps *before* executing any user journey. Failures here block further testing.

- [ ] Build installs without errors on at least **one iOS device/simulator** and **one Android device/emulator**
- [ ] No Metro bundler warnings about missing polyfills when the app boots (watch for `Buffer`, `process`, or `getRandomValues` references in the console)
- [ ] Splash screen renders, app transitions to a screen without crashing within 10 seconds
- [ ] Expo manifest version in **Settings → About → Version** matches the version you are releasing
- [ ] Open **Settings → Network & Environment** and **confirm every line matches the target release**:
  - [ ] Network row shows the correct tier: Testnet / Custom / (if applicable) Mainnet
  - [ ] Tier badge tone is correct: `Test` (info) / `Custom` (warning) / `Live` (error)
  - [ ] Horizon Server hostname matches target network
  - [ ] Soroban RPC hostname matches target network
  - [ ] Vault Mode badge: `Real` (success) only when `EXPO_PUBLIC_VAULT_CONTRACT_ID` is set for this build; else `Mock` (warning)
  - [ ] If Vault Mode = Real: Contract row shows **truncated** (6-ellipsis-6) contract ID, NOT the full 56-char contract address
  - [ ] Warnings stack shows the correct banners for the build: at minimum "Testnet only" (testnet), "Vault running in mock mode" (no contract ID), "Custom network configured" (custom name), or "Mainnet in use" (live)
  - [ ] **No secret, full URL, or full contract ID appears anywhere in the Settings screen** (copy all visible text and grep the paste if unsure)

### 0.1 Test Accounts Required

Prepare these 2 accounts *before* starting the checklist. Use Testnet only; never real keys.

| Role | Notes |
|---|---|
| **Account A (Fresh)** | No existing wallet on the test device. Will test Create Wallet, Fund via Friendbot, first-send, first-time vault. |
| **Account B (Restored)** | Pre-existing wallet on a wiped device. Will test Import Secret Key, balance restore, tx pagination, matured vault lock withdrawal. |

---

## 1. Build Smoke Tests — Happy-Path Boot

- [ ] ✨ **Fresh start (Account A):** Delete the app, reinstall, and launch. No crash on first run. The **Create Wallet / Import Wallet** choice screen loads.
- [ ] ✨ **Cold start (Account B):** Close the app from the app switcher, re-open. Wallet is still loaded and the Home balance screen renders in under 5 seconds.
- [ ] ✨ **App Lock gate:** Open Settings, enable App Lock, background and foreground the app. The **Lock screen overlay** appears and blocks access until biometrics or device passcode succeeds.
- [ ] ✨ **Network offline:** Disable all network connectivity. The red **OfflineBanner** drops down from the top of all tab screens and remains visible until connectivity returns.
- [ ] ✨ **Theme system:** Change theme between Light → Dark → System in Settings. Every tab re-renders and background/text colors update correctly. Re-open the app; the chosen theme persists.

---

## 2. Wallet Flows — Create, Import, Persistence

### 2.1 Wallet Creation (Account A)

- [ ] Tap **Create New Wallet** from the auth landing
- [ ] **Step 1 Generate** — taps Generate, shows public key (G...) and secret key (S...) without crashing
- [ ] **Step 2 Reveal** — secret key is displayed, copy-to-clipboard copies it correctly (paste somewhere to verify)
- [ ] **Step 3 Confirm** — "I backed up my keys" checkbox → Continue completes without crashing
- [ ] **Backup Reminder modal** appears on Home after creation
- [ ] Acknowledge the modal. After next app launch it does **not** reappear.
- [ ] Tap **Fund my Wallet** (Friendbot). Within ~15 seconds the balance updates from `0.0000000` to roughly `10,000.0000000` XLM.
- [ ] **Export Secret Key** from Settings → Wallet. After authentication the secret key matches what was copied during creation.
- [ ] Toggle **Hide Secret Key** again; secret value is removed from screen and clipboard (verify a paste yields non-secret text if applicable).

### 2.2 Wallet Import (Account B)

- [ ] Delete app + reinstall (or Sign Out from previous test), choose **Import Wallet**
- [ ] Type random garbage (not a valid StrKey) into the secret field → validation error, import is blocked
- [ ] Paste Account B's valid secret → import succeeds, redirects to Home
- [ ] Balance matches Account B's last-known on-chain balance (to within 1 ledger close, ~5 s)
- [ ] Transaction history loads the last page of operations (older dates as you scroll down)

### 2.3 Sign Out & Wallet Erasure

- [ ] Settings → **Sign Out & Clear Wallet** → the destructive confirm modal appears
- [ ] Tap **Cancel** → wallet is NOT cleared, still authenticated, modal dismisses
- [ ] Repeat → tap **Confirm** → SecureStore and AsyncStorage wallet data are cleared, app redirects to auth landing (Create/Import)
- [ ] Background + foreground the app after sign-out: user is **still** on the auth landing (no stuck half-authenticated state)

### 2.4 Address Book / Contacts

- [ ] Settings → **Address Book** → empty state renders (if no contacts)
- [ ] Add a contact with name "Alice" and a valid Testnet G-address → saves, list updates
- [ ] Add the **same G-address** again under "Bob" → duplicate guard blocks save; error message shown
- [ ] Add the **same name** "Alice" with a different valid G-address → duplicate guard blocks save (name + address uniqueness both enforced)
- [ ] Delete Alice → row removed, list shrinks
- [ ] Reopen app → deleted contact does not reappear; surviving contacts are preserved

---

## 3. Payment Flows — Send, Receive, Review, Success

### 3.1 Receive

- [ ] Navigate to **Receive tab/button**
- [ ] QR code renders without errors (no blurry or broken SVG box)
- [ ] Copy public key button → clipboard matches what's shown on the Home screen and on Receive
- [ ] Share sheet opens from the Receive screen (if available on that platform)
- [ ] Scan the QR with a second device — decoded content is the plain G-address (no extra prefix, no suffix whitespace)

### 3.2 Scan → Prefill Send

- [ ] Navigate to **Scan** → camera permission request (first run only) is granted
- [ ] Scan the QR code from Receive above → scanner auto-dismisses and prefills the **Send** destination
- [ ] Amount field is still empty and memo field is still empty (no accidental data leaking from QR if none was encoded)

### 3.3 Send XLM — Happy Path

> Use Account A → Account B on Testnet. Send exactly `50.0000000` XLM with memo `Rent-August` for regression.

- [ ] **Send form** — destination (G-address), amount, memo all filled. No validation errors.
- [ ] **Review screen** shows: correct source, correct destination (or truncated + label if contact), correct 50 XLM amount, fee estimate, memo `Rent-August`
- [ ] Tap **Sign & Send**. Phase overlay progresses: Review → Handoff → Signing → Submitting → Complete (no stuck intermediate phase)
- [ ] Within 30s app transitions to **Payment Success** screen
- [ ] Success screen displays the transaction hash. Copy hash → paste to stellar.expert via `getExplorerTxUrl()` — page resolves to the correct operation.
- [ ] Go back to Home → Account A balance decreased by `~50.0000100` (50 XLM + fee)
- [ ] Go to Activity / History → top of list contains **a new row** for today, destination matches Account B, amount matches
- [ ] Tap that history row → **Transaction Detail** screen opens with memo `Rent-August` visible, correct fee, correct operation type (payment)

### 3.4 Send — Negative Validation Cases

- [ ] Send to an invalid address (random text, missing first G, wrong length) → **address validation** blocks navigation to Review screen; inline error shown
- [ ] Send `0` XLM → **amount validation** fails (positive amount required)
- [ ] Send `99,999,999` XLM (more than balance + reserve) → **submit fails** gracefully, inline error banner shows under the Sign button, balance is NOT decreased, retry button / dismiss works.
- [ ] Send with a memo containing > **28 UTF-8 bytes** (e.g. 14 CJK characters × 3 bytes each) → memo validation error, Review not reached.

### 3.5 Send — Cancel & Dismiss Recovery

- [ ] Begin Send → navigate to Review. Press the hardware/OS back button or tap Back on the nav. App returns to Send form with fields intact.
- [ ] Begin send, reach the in-progress **Signing phase overlay** → no cancel button/action should be able to double-submit. Rapid double-tap Sign & Send → **only one** submission reaches Horizon (confirm via stellar.expert hash count later).

---

## 4. Vault Flows — Mock & Real Contract Paths

The vault has two runtime modes. Run BOTH sub-sections for any build that could ship with either configuration.

### 4.1 Mock Mode (default; `EXPO_PUBLIC_VAULT_CONTRACT_ID` unset)

- [ ] Navigate to Vault tab → **Vault Intro Modal** first run appears. Acknowledge. It does **not** reappear on next tab visit.
- [ ] **Network & Environment card in Settings still shows "Vault running in mock mode" warning banner** (confirms the mock isn't silently treated as real)
- [ ] Vault balance starts at `0.0000000` XLM, vault balance row shows `Local Mock` label or equivalent
- [ ] Tap **Deposit** → enter valid amount, confirm modal, submit. In mock mode the operation "succeeds" within 2 seconds and balance increases by that amount.
- [ ] Tap **Withdraw** → amount exceeds balance → validation fails inline, submit blocked.
- [ ] Withdraw an amount ≤ balance → succeeds, balance decreases by that amount, remainder on-chain (or mock remainder) is sensible.

### 4.2 Time-Lock Flows (works in BOTH mock + real)

- [ ] Create a **30-day lock** from the vault screen → lock appears in the list under Pending with countdown of ~30 days
- [ ] Try to **Withdraw Pending** lock → action is disabled / fails with "not yet matured" copy (exact wording depends on build — confirm no funds move)
- [ ] Simulate a matured lock (for tests, either set device clock forward in mock-only, or use a pre-seeded matured test lock):
  - [ ] Lock appears under **Matured** section with "Available to withdraw" label
  - [ ] Initiate **Withdraw matured lock** → eligibility evaluation runs server-side (NOT from UI state alone) in the store action
  - [ ] After success → lock is **removed from list** only after the on-chain (or mock) transaction succeeds, never before.
  - [ ] Vault balance increases by exactly the locked principal + any rewards shown at lock creation.
- [ ] Repeat matured withdrawal rapidly on the same lock → server-side guard or optimistic client-side guard prevents double-withdrawal.

### 4.3 Real Soroban Contract Mode (when `EXPO_PUBLIC_VAULT_CONTRACT_ID` is configured)

- [ ] Open Settings → Network & Environment → Vault Mode badge reads `Real` (success tone), Contract row shows truncated ID
- [ ] Vault Intro Modal does **not** show a warning that says "this is a mock" (copy should be correct for real mode)
- [ ] Any successful deposit shows up on-chain (verify via stellar.expert / Soroban RPC) within 1 ledger close.
- [ ] Any successful withdrawal decreases vault balance on-chain and in-app within 10 seconds.

---

## 5. Error Handling & Edge-Case Regression

### 5.1 Network Errors

- [ ] **Home screen, Pull-to-refresh while offline** → offline banner, spinner eventually stops, no crash, last-known balance still visible.
- [ ] **Horizon server returns 5xx during balance refresh** → NetworkStatusBanner with severity warning appears, shows copy "Unable to reach Stellar network" (or team's chosen error copy), balance stays at cached value.
- [ ] **Soroban RPC returns error during vault balance load** → vault card shows a per-card error state (not crash) while Home and History still render with their Horizon data.

### 5.2 Wallet Storage Corruption Recovery

- [ ] **Mimic corrupt secret storage** (manual test: inject empty string / invalid JSON into SecureStore key `pocketpay_wallet_secret` via dev tools if possible) → next app boot:
  - [ ] Invalid value is silently deleted (see walletStore test cases)
  - [ ] User lands on **auth landing** (not stuck on half-authenticated Home)
  - [ ] No crash, no red screen, no raw error message displayed to user beyond a polite toast if implemented
- [ ] **Sign Out** after corruption is repeatable; re-import valid secret afterwards succeeds and rehydrates balance from chain.

### 5.3 React Error Boundary

- [ ] Trigger a synthetic render-time error via **Diagnostics screen** (or a local dev-only method of throwing inside child render):
  - [ ] **ErrorBoundaryFallback** screen appears — full overlay, not a partial crash
  - [ ] Fallback has a reload/retry CTA
  - [ ] Global exception handler runs: check for the `reportError` funnel call in console/monitoring (if Sentry wired)

### 5.4 Signing Handoff State Machine

Use the diagnostics panel or store inspection to verify phase never jumps backwards:

- [ ] Signing phases progress exactly `idle → review → handoff → signing → submitting → completed`
- [ ] Failure path phases exactly `… → failed` with a structured error type; re-tap resets cleanly from failed back to review
- [ ] Cancel path phases exactly `… → cancelled`; restart from review works

---

## 6. Accessibility Spot Checks (Mobile)

Full audit → [Accessibility Checklist](./accessibility.md). For releases, at minimum spot-check:

- [ ] Every tappable row in Settings, History, Vault list has an accessible label (`accessibilityLabel`) and a 44×44 pt minimum touch target
- [ ] Home screen balance is marked as a header / heading (not just a `<Text>`) for screen-reader navigation
- [ ] The Sign & Send button on the Review screen has `accessibilityRole="button"` and a descriptive label that **includes the amount** if possible (not just "Next")
- [ ] Error banners and warning banners announce themselves as live regions and read their full title + message on TalkBack/VoiceOver
- [ ] Vault countdown labels are exposed as Text nodes, not just rendered SVG/gradients that screen readers skip
- [ ] Dark mode: vault success badge, warning badge, and error banner text all meet **minimum 4.5:1 contrast** (eye-check or use dev-tools color picker)

---

## 7. Settings, Persistence & Environment Final Checks

- [ ] **Settings → About → Diagnostics** link → Diagnostics screen opens and shows redacted counters only. Full G-address never appears; instead `hasPublicKey: true/false` is shown.
- [ ] Close the app from task switcher, re-open:
  - [ ] Theme choice persists (light/dark/system)
  - [ ] App Lock toggle persists (enabled yesterday still enabled today)
  - [ ] Contacts list persists (Alice/Bob rows same as last session)
  - [ ] Backup reminder acknowledged flag persists
  - [ ] Vault intro modal acknowledged flag persists
- [ ] Change network name `EXPO_PUBLIC_STELLAR_NETWORK=CUSTOMNET` in a test build → Settings → Network & Environment:
  - [ ] Label says `CUSTOMNET` (correct raw name)
  - [ ] Tier badge = `Custom` (warning tone)
  - [ ] Warning banner stack **now includes** "Custom network configured" advisory

---

## 8. Cross-Platform & Environment Matrix

Fill one row per device-config combination tested. Minimum for release = 4 cells completed.

| OS       | Device / Simulator | Theme    | Vault Mode | Result (✅/⚠️/❌) | Notes |
|---|---|---|---|---|---|
| iOS 18+  | iPhone 15 / SE 3rd gen | Light    | Mock     | | |
| iOS 18+  | iPhone 15 / SE 3rd gen | Dark     | Mock     | | |
| Android 14+ | Pixel 8 / emulator 64-bit | System | Real (if applicable) | | |
| Android 14+ | Pixel 8 / emulator 64-bit | Light  | Mock     | | |
| *Optional:* Tablet (iPadOS / Android Tab) | | | | | |

---

## 9. Automated Checks (Record Results)

Run locally before tagging the release. Copy-paste output or note exit codes.

| Automated Step | Command | Result |
|---|---|---|
| TypeScript strict | `npx tsc --noEmit` | ✅ exit 0 / ❌ ___ errors |
| Jest suite | `npm test` (pinned jest-expo preset) | ✅ ___ passed / ❌ ___ failed |
| SDK API baseline | `npm run api:check` | ✅ matches baseline / ❌ drift |
| Expo doctor | `npx expo-doctor` | ✅ 0 issues / ⚠️ ___ warnings |
| Deduplicated pagination (walletStore) | Verified via `__tests__/walletStore.pagination.test.ts` | ✅ / ❌ |
| Matured withdrawal server-side eligibility | Verified via `__tests__/vaultStore.withdrawMaturedLock.test.ts` & `maturedLockWithdrawal.test.ts` | ✅ / ❌ |
| Global error handler install | Verified via `__tests__/globalErrorHandler.test.tsx` | ✅ / ❌ |
| Backup reminder persistence | Verified via `__tests__/BackupReminderModal.test.tsx` | ✅ / ❌ |

---

## 10. Final Sign-Off

- [ ] All Phase 0 → 9 checks above that apply to this build have been run.
- [ ] Any ⚠️ / ❌ items have a **written note** describing the bug, linked issue ticket, or explicit approval to ship with the known issue.
- [ ] No Mainnet build was shipped without **Phase 0.1 Network tier = Live (error)** banner confirmation and a second human confirming `EXPO_PUBLIC_STELLAR_NETWORK_PASSPHRASE` matches the public network passphrase.
- [ ] Release notes / CHANGELOG have been updated to reflect user-facing changes.
- [ ] Screenshots in README.md (if committed for this release) were captured using Testnet-only dummy accounts with **no real or shared secret keys**.

---

**Release Manager sign-off:**

Name: ________________________ &nbsp; Signature: ________________________ &nbsp; Date: ____ / ____ / ____
