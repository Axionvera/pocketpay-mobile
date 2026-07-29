# Stellar PocketPay

React Native Expo wallet for Stellar Testnet. The app aims to feel polished and usable for core wallet flows while still evolving as the PocketPay ecosystem matures.

## Project Status

- This project is best described as a polished but still-evolving wallet experience rather than a production-ready product.
- Core flows such as wallet creation and import, balance checks, sending and receiving, contacts, and the vault UI are implemented and actively refined.
- The app is intentionally focused on Stellar Testnet for development and experimentation. Testnet XLM has no real monetary value.
- The vault experience is currently mock-backed by default. A real Soroban contract integration can be enabled with configuration, but the default experience remains a safe placeholder.

## Documentation

- [Architecture Readiness Review](./docs/architecture-readiness-review.md) - Feature boundaries, duplicated state, SDK integration blockers, security-sensitive areas, and test gaps
- [Evaluation Readiness Checklist](./docs/evaluation-readiness-checklist.md) - GrantFox contributor checklist for contract issues, including tests, CI, issue requirements, edge cases, and the reminder that merge does not guarantee payment approval
- [Storage Guide](./docs/storage.md) - SecureStore vs AsyncStorage
- [Contacts Guide](./docs/contacts.md) - Contact storage, backup limitations, and future export/import ideas
- [Polyfills Guide](./docs/polyfills.md) - React Native polyfills and import order for Stellar SDK
- [Vault UI Guidance](./docs/vault-ui-guidance.md) - How to present the Soroban Savings Vault, Testnet risks, and contract limitations
- [Vault Integration Assumptions](./docs/vault-integration-assumptions.md) - Document expected SDK/contract dependencies, placeholder behaviors, and known gaps
- [Vault Integration Risks](./docs/vault-integration-risks.md) - Assumptions, risks, and integration points between the mobile UI, PocketPay SDK, and Soroban contract
- [Mobile Wallet Security FAQ](./docs/WALLET_SECURITY_FAQ.md) - Local storage, secret handling, reset behaviors, and security guarantees
- [Accessibility Checklist](./docs/accessibility.md) - Required mobile accessibility checks and reusable-component review guidance for major screens and every UI state
- [UI State Catalogue](./docs/ui-states.md) - Canonical loading, empty, error, success, disabled, and pending behavior for wallet, send, receive, transactions, contacts, vault, settings, and diagnostics
- [Scan-to-Pay Review](./docs/scan-to-pay.md) - QR scan → validate → review screen → cancel-before-payment flow (never signs on scan)
- [Release Testing Checklist](./docs/release-testing-checklist.md) - Manual QA checklist run before every tagged build, covering wallet, payment, vault, errors, and environment verification

> ⚠️ **This app runs on the Stellar Testnet only.** Testnet XLM has no real monetary value. Read the [Security Guide](docs/security.md) before storing or sharing any keys.

## Features

- Wallet creation and import
- XLM balance and transactions
- Send and receive with QR codes
- Address book contacts
- Soroban vault placeholder

For the expected screen sequence, validation, and UI states behind these features, see [Main wallet user flows](docs/user-flows.md).

## Ecosystem

PocketPay Mobile is part of a broader PocketPay stack:

- [PocketPay SDK](https://github.com/Axionvera/pocketpay-sdk)
- [PocketPay Contracts](https://github.com/Axionvera/pocketpay-contracts)

## Documentation

- [Screen Inventory](docs/screen-inventory.md) - A map of the main screens and routes in the app.
- [Mobile Onboarding Checklist](docs/mobile-onboarding-checklist.md) - Quick-reference setup checklist for new contributors
- [Evaluation Readiness Checklist](docs/evaluation-readiness-checklist.md) - Contract-issue review checklist for GrantFox contributors before payment evaluation
- [Meaningful Change Guide](docs/meaningful-change-guide.md) - What counts as meaningful mobile implementation work, with examples of incomplete vs. acceptable PRs
- [UI State Catalogue](docs/ui-states.md) and [Accessibility Checklist](docs/accessibility.md) - Governance for major-screen states, shared component contracts, and accessible review evidence
- [QR Receive Payload Format](docs/qr-payment-requests.md) - The address-only and SEP-0007-based payment-request formats the Receive screen encodes into its QR code

## Screenshots

> 📸 Screenshots below are placeholders. To update them, capture each screen from a simulator or device (use dummy/funded Testnet data only — never real keys or mainnet funds) and replace the files in `docs/screenshots/`.

|                    Wallet                     |                  Send                  |                     Receive                      |
| :-------------------------------------------: | :------------------------------------: | :----------------------------------------------: |
| ![Wallet screen](docs/screenshots/wallet.png) | ![Send screen](docs/screenshots/send.png) | ![Receive screen](docs/screenshots/receive.png) |
|      _Balance overview and quick actions_      |     _Send XLM to any Stellar address_  |          _QR code for your public key_           |

|                       Activity                       |                     Contacts                      |                    Vault                    |
| :--------------------------------------------------: | :-----------------------------------------------: | :-----------------------------------------: |
|  ![Activity screen](docs/screenshots/activity.png)   | ![Contacts screen](docs/screenshots/contacts.png) | ![Vault screen](docs/screenshots/vault.png) |
| _Transaction history with sent/received indicators_  |        _Saved addresses for quick access_         |       _Soroban Savings Vault (mock)_        |

### Updating screenshots

1. Run the app in a simulator with a funded Testnet account.
2. Navigate to the relevant screen.
3. Take a screenshot and export it at roughly **390 × 844 px** (iPhone 14 logical resolution) or equivalent Android size.
4. Save it to `docs/screenshots/<screen-name>.png` using the filenames shown above.
5. Commit only the image files — never include screenshots that reveal a real secret key or personal data.

## Tech Stack

React Native, Expo Router, Zustand, PocketPay SDK, SecureStore, AsyncStorage

## Quick Start

```bash
npm install --legacy-peer-deps
cp .env.example .env
npm start
