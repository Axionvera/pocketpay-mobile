# Stellar PocketPay

A production-quality React Native Expo application for interacting with the Stellar Testnet.

## Documentation

- [Storage Guide](./docs/storage.md) - SecureStore vs AsyncStorage

## Features

- Wallet Management: Create or import Stellar Testnet wallets
- Balance & Activity: Real-time XLM balance and transactions
- Send & Receive: Send XLM with QR code support
- Address Book: Save frequent contacts
- Soroban Vault (Mock): Smart contract integration placeholder

## Tech Stack

- Framework: React Native with Expo
- Navigation: Expo Router
- State Management: Zustand
- Storage: expo-secure-store, @react-native-async-storage/async-storage
- Blockchain: @stellar/stellar-sdk

## Getting Started

### Prerequisites

- Node.js (v18+)
- Expo CLI
- Expo Go app or simulator

### Installation

npm install --legacy-peer-deps
cp .env.example .env

### Running

npm start

## License

MIT
