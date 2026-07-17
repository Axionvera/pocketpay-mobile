# Screen Inventory

This document provides a quick map of the main screens and routes in the Stellar PocketPay app. The app uses Expo Router for navigation.

## `app/(tabs)/index.tsx` (Main Wallet)
*   **Route Name:** `/(tabs)/` (or Home)
*   **Purpose:** Displays the total balance, public key, and recent activity preview. Serves as the main dashboard.
*   **Key Components:** `Button`, `ScrollView`, `RefreshControl`
*   **State Dependencies:** `useWalletStore` (publicKey, balance, transactions, isLoading, refreshWalletData)
*   **Related SDK Calls:** N/A (Data fetched via store)

## `app/send.tsx`
*   **Route Name:** `/send`
*   **Purpose:** Allows the user to send XLM to a destination address.
*   **Key Components:** `Input`, `Button`, `KeyboardAvoidingView`
*   **State Dependencies:** `useWalletStore` (getSecretKey, refreshWalletData, balance)
*   **Related SDK Calls:** `sendXlmTransaction` (from `src/services/stellar`)

## `app/receive.tsx`
*   **Route Name:** `/receive`
*   **Purpose:** Displays the user's public key and QR code to receive payments.
*   **Key Components:** `QRCode` (react-native-qrcode-svg), `Button`
*   **State Dependencies:** `useWalletStore` (publicKey)
*   **Related SDK Calls:** N/A

## `app/(tabs)/history.tsx` (Activity)
*   **Route Name:** `/(tabs)/history`
*   **Purpose:** Lists all recent transactions (sent and received) for the current wallet.
*   **Key Components:** `FlatList`, `RefreshControl`
*   **State Dependencies:** `useWalletStore` (transactions, isLoading, refreshWalletData, publicKey)
*   **Related SDK Calls:** N/A (Data fetched via store)

## `app/contacts.tsx`
*   **Route Name:** `/contacts`
*   **Purpose:** Manages the address book. Allows adding and removing contacts (names and public keys).
*   **Key Components:** `FlatList`, `Input`, `Button`
*   **State Dependencies:** `useAppStore` (contacts, addContact, removeContact)
*   **Related SDK Calls:** N/A

## `app/(tabs)/vault.tsx`
*   **Route Name:** `/(tabs)/vault`
*   **Purpose:** A placeholder UI for a Soroban Savings Vault integration. Simulates depositing and withdrawing.
*   **Key Components:** `Input`, `Button`
*   **State Dependencies:** `useWalletStore` (publicKey, getSecretKey)
*   **Related SDK Calls:** `mockFetchVaultBalance`, `mockDepositToVault`, `mockWithdrawFromVault` (from `src/services/stellar`)
