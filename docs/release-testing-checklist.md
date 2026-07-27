# Mobile Release Testing and Regression Checklist

## Overview

This checklist provides a comprehensive testing guide for mobile releases. Use this checklist before every release to ensure key flows work correctly and no regressions are introduced.

## Quick Reference

| Phase | Time | Purpose |
|-------|------|---------|
| Smoke Tests | 15 min | Verify core functionality works |
| Regression Tests | 45 min | Ensure no new bugs introduced |
| Platform Tests | 30 min | Test on iOS and Android |
| Security Tests | 20 min | Verify security features |
| Accessibility Tests | 20 min | Ensure accessibility compliance |
| Performance Tests | 15 min | Check app performance |
| **Total** | **~2.5 hours** | |

---

## 1. Wallet Tests

### Wallet Creation
- [ ] Create new wallet with seed phrase
- [ ] Seed phrase is displayed only once
- [ ] Seed phrase confirmation works
- [ ] Wallet backup reminder is shown

### Wallet Import
- [ ] Import wallet with valid seed phrase
- [ ] Import wallet with invalid seed phrase (rejected)
- [ ] Import wallet with valid private key
- [ ] Import wallet with invalid private key (rejected)
- [ ] Import history is not stored

### Wallet Management
- [ ] Switch between multiple wallets
- [ ] View wallet balance
- [ ] View wallet address
- [ ] Copy wallet address
- [ ] QR code for wallet address
- [ ] Delete wallet (with confirmation)

### Error States
- [ ] Network error during wallet creation
- [ ] Network error during wallet import
- [ ] Invalid seed phrase handling
- [ ] Insufficient balance handling
- [ ] Error messages are user-friendly

### Loading States
- [ ] Loading spinner during wallet creation
- [ ] Loading spinner during wallet import
- [ ] Skeleton screens for balance display
- [ ] Loading states are smooth

---

## 2. Payment Tests

### Send Payment
- [ ] Enter valid recipient address
- [ ] Enter invalid recipient address (rejected)
- [ ] Enter amount
- [ ] Enter amount with decimals
- [ ] Enter memo (optional)
- [ ] Verify transaction details before sending
- [ ] Transaction signing confirmation
- [ ] Success toast/notification
- [ ] Transaction appears in history

### Receive Payment
- [ ] Display QR code
- [ ] QR code scans correctly
- [ ] Copy wallet address
- [ ] Share wallet address
- [ ] QR code with amount pre-filled
- [ ] QR code with memo pre-filled

### Transaction History
- [ ] View transaction list
- [ ] Transaction direction indicators (sent/received)
- [ ] View transaction details
- [ ] Transaction status (pending/completed/failed)
- [ ] Transaction timestamp
- [ ] Transaction amount and asset
- [ ] Transaction hash (tap to copy)
- [ ] Pull to refresh
- [ ] Pagination/loading more

### Error States
- [ ] Network error during send
- [ ] Insufficient balance error
- [ ] Invalid address error
- [ ] Network error during receive
- [ ] Network error during history load
- [ ] Error messages are user-friendly

### Loading States
- [ ] Loading spinner during send
- [ ] Skeleton screens for history
- [ ] Pending transaction status
- [ ] Refresh indicator

---

## 3. Contacts Tests

### Contact Management
- [ ] Add new contact
- [ ] Edit existing contact
- [ ] Delete contact
- [ ] Contact name and address
- [ ] Contact name only
- [ ] Duplicate contact handling

### Contact Usage
- [ ] Select contact for payment
- [ ] Contact autocomplete in send
- [ ] Contact QR code
- [ ] Contact details view

### Error States
- [ ] Network error during contact add
- [ ] Duplicate contact error
- [ ] Network error during contact list load
- [ ] Error messages are user-friendly

### Loading States
- [ ] Loading spinner during contact add
- [ ] Skeleton screens for contact list
- [ ] Loading spinner during contact edit
- [ ] Loading spinner during contact delete

---

## 4. Vault Tests

### Vault Access
- [ ] Vault requires authentication
- [ ] Biometric authentication works
- [ ] PIN authentication works
- [ ] Failed authentication attempts limited
- [ ] Access timeout works

### Vault Storage
- [ ] Add item to vault
- [ ] View vault items
- [ ] Edit vault items
- [ ] Delete vault items
- [ ] Item encryption

### Vault Export/Import
- [ ] Export vault data
- [ ] Export requires authentication
- [ ] Import vault data
- [ ] Import validates data integrity

### Error States
- [ ] Authentication error
- [ ] Network error during vault access
- [ ] Invalid import data error
- [ ] Error messages are user-friendly

### Loading States
- [ ] Loading spinner during vault access
- [ ] Skeleton screens for vault items
- [ ] Loading spinner during import/export

---

## 5. QR Code Tests

### QR Scanning
- [ ] QR scanner opens correctly
- [ ] Camera permissions requested
- [ ] QR code detection works
- [ ] Stellar address QR code detection
- [ ] Payment request QR code detection
- [ ] Invalid QR code handling

### QR Generation
- [ ] Wallet address QR code
- [ ] Payment request QR code with amount
- [ ] Payment request QR code with memo
- [ ] QR code sharing

### Error States
- [ ] Camera permission denied
- [ ] Invalid QR code scanned
- [ ] Network error during QR generation
- [ ] Error messages are user-friendly

### Loading States
- [ ] Loading spinner during QR scan
- [ ] Loading spinner during QR generation
- [ ] Processing indicator for QR scan

---

## 6. Settings Tests

### General Settings
- [ ] Currency display settings
- [ ] Language settings
- [ ] Theme settings (light/dark)
- [ ] Notification preferences

### Security Settings
- [ ] Password change
- [ ] Biometric authentication toggle
- [ ] Session timeout settings
- [ ] Auto-lock settings

### Privacy Settings
- [ ] Analytics opt-out
- [ ] Data sharing preferences
- [ ] Export data
- [ ] Delete data

### Error States
- [ ] Network error during settings save
- [ ] Invalid password error
- [ ] Biometric not available error
- [ ] Error messages are user-friendly

### Loading States
- [ ] Loading spinner during settings save
- [ ] Loading spinner during password change
- [ ] Loading spinner during data export

---

## 7. Security Tests

### Authentication
- [ ] Biometric authentication works
- [ ] PIN authentication works
- [ ] Password authentication works
- [ ] Failed attempts limited
- [ ] Session timeout works

### Secure Storage
- [ ] Private keys stored in secure storage
- [ ] Seeds stored in secure storage
- [ ] Passwords stored in secure storage
- [ ] No sensitive data in AsyncStorage

### Clipboard Security
- [ ] Copy address shows warning
- [ ] Copy private key blocked
- [ ] Copy seed phrase blocked

### Screenshots
- [ ] Screenshots blocked on sensitive screens
- [ ] App content hidden in app switcher

### Error States
- [ ] Authentication failure
- [ ] Biometric not available
- [ ] Secure storage error
- [ ] Error messages are user-friendly

### Loading States
- [ ] Loading spinner during authentication
- [ ] Loading spinner during biometric setup
- [ ] Loading spinner during PIN setup

---

## 8. Accessibility Tests

### Screen Reader Support
- [ ] All screens have appropriate labels
- [ ] Buttons have accessibility labels
- [ ] Images have alt text
- [ ] Touch targets are at least 44x44pt
- [ ] Focus indicators visible

### Color and Contrast
- [ ] Text contrast ratio ≥ 4.5:1
- [ ] Interactive elements have distinct colors
- [ ] Error messages are color-independent
- [ ] Dark mode support works

### Text and Typography
- [ ] Font sizes are scalable
- [ ] Text truncation works
- [ ] Bold/italic text works
- [ ] Dynamic type support (iOS)

### Navigation
- [ ] Keyboard navigation works (Android)
- [ ] Tab order is logical
- [ ] Skip navigation (if applicable)

### Error States
- [ ] Accessibility error announcements
- [ ] Error messages are screen-reader friendly
- [ ] Loading states are announced

### Loading States
- [ ] Loading states are accessible
- [ ] Progress indicators announced

---

## 9. Performance Tests

### App Startup
- [ ] App starts within 3 seconds
- [ ] Cold start performance
- [ ] Warm start performance

### Navigation
- [ ] Screen transitions smooth
- [ ] Back navigation works
- [ ] Deep linking works

### Data Loading
- [ ] Transaction history loads quickly
- [ ] Contact list loads quickly
- [ ] Balance updates quickly

### Memory Usage
- [ ] Memory usage < 200MB
- [ ] No memory leaks
- [ ] App doesn't crash under memory pressure

### Battery Usage
- [ ] App doesn't drain battery excessively
- [ ] Background processes optimized

---

## 10. Diagnostics Tests

### Error Reporting
- [ ] Errors are reported correctly
- [ ] Error context included
- [ ] Errors are anonymized

### Analytics
- [ ] Analytics events fire correctly
- [ ] No sensitive data in analytics
- [ ] Analytics opt-out works

### Logging
- [ ] No sensitive data in logs
- [ ] Log levels are appropriate
- [ ] Log rotation works

### Network
- [ ] API requests succeed
- [ ] Retry logic works
- [ ] Timeout handling works

---

## 11. Platform-Specific Tests

### iOS Tests
- [ ] App runs on latest iOS
- [ ] App runs on iOS 15+
- [ ] iPhone 14 Pro (latest)
- [ ] iPhone 12 (medium)
- [ ] iPhone SE (small)

### Android Tests
- [ ] App runs on latest Android
- [ ] App runs on Android 8+
- [ ] Pixel 7 (latest)
- [ ] Samsung S22 (medium)
- [ ] Pixel 4 (small)

### Device Orientation
- [ ] Portrait mode works
- [ ] Landscape mode works
- [ ] Orientation rotation works

### Keyboard Input
- [ ] Keyboard appears correctly
- [ ] Keyboard dismisses correctly
- [ ] Keyboard shortcuts work (Android)

---

## 12. Regression Test Suite

### Critical Paths
- [ ] Create wallet → Add balance → Send payment
- [ ] Import wallet → Send payment → View history
- [ ] Create wallet → Receive payment → View history
- [ ] Create wallet → Add contact → Send to contact
- [ ] Create wallet → Create vault item → View vault

### Edge Cases
- [ ] Zero balance handling
- [ ] Very large amounts
- [ ] Very small amounts
- [ ] Special characters in memo
- [ ] Long memo
- [ ] Non-ASCII characters
- [ ] Emoji support

### Error Recovery
- [ ] Network disconnection handling
- [ ] Server error handling
- [ ] Timeout handling
- [ ] Retry logic

### State Management
- [ ] State persists after app restart
- [ ] State persists after app update
- [ ] State persists after device restart

---

## 13. Release Build Tests

### App Build
- [ ] App builds successfully
- [ ] App size is reasonable
- [ ] App signing works
- [ ] App store deployment works

### Version Information
- [ ] Version number correct
- [ ] Build number correct
- [ ] Release notes included

### Update Test
- [ ] Update from previous version works
- [ ] Update doesn't break data
- [ ] Update doesn't break settings

---

## 14. Unsupported Features

### Feature Flags
- [ ] Disabled features are hidden
- [ ] Disabled features are inaccessible
- [ ] Disabled features don't show errors

### Fallback Behavior
- [ ] Fallback works for missing features
- [ ] Graceful degradation works
- [ ] Error messages for missing features

### Platform Limitations
- [ ] iOS-specific features work
- [ ] Android-specific features work
- [ ] Missing features are handled

---

## 15. Test Environment Setup

### Test Devices
- [ ] iOS simulator/device ready
- [ ] Android emulator/device ready
- [ ] Test accounts ready
- [ ] Test data ready

### Test Network
- [ ] Testnet configured
- [ ] Network fallback works
- [ ] Network error simulation works

### Test Accounts
- [ ] Wallet with balance
- [ ] Wallet with contacts
- [ ] Wallet with transaction history
- [ ] Wallet with vault items

---

## Test Execution Log

| Date | Tester | Results | Issues Found | Issues Fixed | Sign-off |
|------|--------|---------|--------------|--------------|----------|
| | | | | | |

## Test Sign-off

- [ ] All tests passed
- [ ] All critical issues fixed
- [ ] All high-priority issues fixed
- [ ] Known issues documented
- [ ] Regression plan approved
- [ ] Release approved

## Quick Test Commands

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Run accessibility tests
npm run test:a11y

# Run performance tests
npm run test:performance
