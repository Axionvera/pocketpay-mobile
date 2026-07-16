# Stellar PocketPay 🚀

A polished React Native Expo wallet for the **Stellar Testnet**, part of the evolving PocketPay ecosystem. This mobile app lets users generate and store keypairs, view XLM balances, send and receive Testnet XLM, browse transaction history, manage contacts, and explore a mock Soroban Savings Vault UI.

> **⚠️ Project Status — Actively evolving.** PocketPay works end-to-end on Testnet, but several areas (detailed below) are still being iterated on. Expect refinements and breaking changes as we approach a production-ready release.

## Features

*   **Wallet Management**: Create a new Stellar Testnet wallet or import an existing one using a secret key. Keys are securely stored on the device using `expo-secure-store`.
*   **Balance & Activity**: View your real-time XLM balance and recent transactions.
*   **Send & Receive**: Send XLM to any Stellar address. Receive XLM easily by sharing your auto-generated QR code.
*   **Address Book**: Save frequently used addresses in your contacts for quick access.
*   **Soroban Vault (Mock)**: A UI placeholder demonstrating where future Soroban smart contract integrations (like a savings vault) would live. **Not backed by deployed contracts** — balances and state shown are simulated.
*   **Premium UI**: Clean, modern fintech aesthetic with dark mode support.

For the expected screen sequence, validation, and UI states behind these features, see [Main wallet user flows](docs/user-flows.md).

## Project Status

| Area | Status |
|------|--------|
| **Testnet wallet (send, receive, balance)** | ✅ Functional — daily-driver ready on Testnet |
| **Key generation & import** | ✅ Functional |
| **Transaction history** | ✅ Functional |
| **Address book** | ✅ Functional |
| **Soroban Vault (mock)** | 🚧 UI only — no on-chain contracts yet |
| **Mainnet readiness** | ❌ Not planned until future release |

PocketPay currently operates **exclusively on Stellar Testnet**. All transactions use Testnet XLM (no real value). Mainnet support is on the roadmap but not yet available.

## Ecosystem

PocketPay is part of a broader collection of projects:

- **[stellar-sdk](https://github.com/stellar/stellar-sdk)** — The official Stellar SDK used by this app for keypair generation, transaction building, and Horizon interaction.
- **[pocketpay-contracts](https://github.com/stellar/soroban-examples)** — Companion Soroban smart contracts (work in progress). The mock Vault UI is designed to align with these contracts once deployed.

## Tech Stack

*   **Framework**: React Native with Expo (Managed Workflow)
*   **Navigation**: Expo Router (File-based routing)
*   **State Management**: Zustand
*   **Storage**: `expo-secure-store`, `@react-native-async-storage/async-storage`
*   **Blockchain**: `@stellar/stellar-sdk` (with required React Native polyfills)

## Getting Started

### Prerequisites

*   Node.js (v18+ recommended)
*   npm or yarn
*   Expo CLI (`npm install -g expo-cli`)
*   Expo Go app on your physical device, or an iOS Simulator / Android Emulator.

### Installation

1.  **Clone the repository** (if applicable) or navigate to the project directory:
    ```bash
    cd stellar-pocketpay-mobile
    ```

2.  **Install dependencies**:
    ```bash
    npm install --legacy-peer-deps
    ```
    *(Note: `--legacy-peer-deps` is required due to React 19 peer dependency conflicts in some React Native libraries)*

3.  **Environment Variables**:
    The project includes a `.env.example` file. Copy it to `.env`:
    ```bash
    cp .env.example .env
    ```
    The default values are configured for the **Stellar Testnet**. Do not change them to Mainnet — the app is not yet Mainnet-ready.

### Running the App

Start the Expo development server:

```bash
npm start
```

Press `i` to open in iOS simulator, `a` to open in Android emulator, or scan the QR code with the Expo Go app on your physical device.

## Polyfills for the Stellar SDK

The `@stellar/stellar-sdk` is designed for Node.js and browser environments. To make it work in React Native, this project includes several polyfills (`buffer`, `react-native-get-random-values`, `events`, etc.) configured in `shim.js` and imported at the top of `app/_layout.tsx`.

## Funding Your Testnet Account

Newly created wallets start with **0 XLM** and do not yet exist on the ledger. To fund yours:

1. Copy your Public Key from the app.
2. Go to the [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#create-account) (Testnet).
3. Paste your Public Key and click **"Get test network XLM"**.

> 💡 Testnet XLM has **no real monetary value**. It's only used for development and testing.

## License

MIT
