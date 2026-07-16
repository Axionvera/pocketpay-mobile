# Storage Guide

This document explains what data is stored in SecureStore versus AsyncStorage in PocketPay Mobile.

## SecureStore

SecureStore provides encrypted storage for sensitive data.

### What Goes in SecureStore

| Data | Reason |
|------|--------|
| Secret keys (S...) | Full account control |
| Mnemonic phrases | Can derive secret keys |
| PIN codes | Authentication bypass |

### What Does NOT Go in SecureStore

| Data | Reason |
|------|--------|
| Public keys (G...) | Public by design |
| Transaction history | Already on-chain |
| Contact addresses | Non-sensitive |
| UI preferences | Non-sensitive |

## AsyncStorage

AsyncStorage provides unencrypted storage for non-sensitive app data.

### What Goes in AsyncStorage

| Data | Reason |
|------|--------|
| Public keys | Public information |
| Contact list | Address book |
| Transaction hashes | Already on-chain |
| UI preferences | Non-sensitive |
| Language preference | Non-sensitive |

### What Does NOT Go in AsyncStorage

| Data | Reason |
|------|--------|
| Secret keys | Plaintext exposure |
| Mnemonic phrases | Plaintext exposure |
| PIN codes | Authentication risk |

## Sensitive Data Handling Rules

1. Secret keys only in SecureStore
2. Never log secret keys or mnemonics
3. Clear SecureStore on logout
4. Public keys safe in AsyncStorage
5. Transaction hashes safe to store

## Usage

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

await SecureStore.setItemAsync('secretKey', wallet.secretKey);
await AsyncStorage.setItem('publicKey', wallet.publicKey);
