# Storage Guide

This document explains what data is stored in SecureStore versus AsyncStorage in PocketPay Mobile.

## SecureStore

SecureStore provides encrypted storage for sensitive data. Use it for anything that could compromise user funds if exposed.

### What Goes in SecureStore

| Data | Reason |
|------|--------|
| Secret keys (S...) | Full account control |
| Mnemonic phrases | Can derive secret keys |
| PIN codes / biometric keys | Authentication bypass |
| API keys with write access | Transaction authorization |

### What Does NOT Go in SecureStore

| Data | Reason |
|------|--------|
| Public keys (G...) | Public by design |
| Transaction history | Already on-chain |
| Contact addresses | Non-sensitive |
| UI preferences | Non-sensitive |
| Theme settings | Non-sensitive |

## AsyncStorage

AsyncStorage provides unencrypted key-value storage. Use it for non-sensitive app data.

### What Goes in AsyncStorage

| Data | Reason |
|------|--------|
| Public keys | Public information |
| Contact list | User-managed address book |
| Recent transaction hashes | Already public on-chain |
| UI theme preference | Non-sensitive setting |
| Language preference | Non-sensitive setting |
| Last viewed screen | Navigation state |
| Notification preferences | Non-sensitive toggles |

### What Does NOT Go in AsyncStorage

| Data | Reason |
|------|--------|
| Secret keys | Would be stored in plaintext |
| Mnemonic phrases | Would be stored in plaintext |
| PIN codes | Authentication bypass risk |

## Sensitive Data Handling Rules

1. Secret keys and mnemonics must only be stored in SecureStore
2. Never log secret keys or mnemonics
3. Clear SecureStore on app uninstall or logout
4. Public keys can be stored in AsyncStorage for convenience
5. Transaction hashes are safe to store and display
6. Contact addresses should be stored in AsyncStorage

## Storage Service Usage

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store a secret key
await SecureStore.setItemAsync('secretKey', wallet.secretKey);

// Store a public key
await AsyncStorage.setItem('publicKey', wallet.publicKey);

// Store contacts
await AsyncStorage.setItem('contacts', JSON.stringify(contacts));

// Retrieve secret key
const secretKey = await SecureStore.getItemAsync('secretKey');

// Retrieve contacts
const contacts = JSON.parse(await AsyncStorage.getItem('contacts') || '[]');
