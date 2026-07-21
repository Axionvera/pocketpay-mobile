**Close:** # (I'll add the issue number here)

---

## Summary of the Issue

When users add or edit saved contacts in the address book, there is no duplicate detection. This can result in the same recipient being saved more than once — either by the same public key (address) or by the same display name. Users need clear, actionable feedback when a duplicate is detected.

---

## Root Cause

Duplicate detection logic was implemented **only at the UI layer** (`app/contacts.tsx`) using local helper functions (`isDuplicateAddress`, `findExistingContactByAddress`, `findExistingContactByName`). There was **no centralized enforcement at the store layer** (`src/store/appStore.ts`), meaning:

- Any code path calling `addContact` directly could bypass duplicate checks
- There were no reusable validation utilities for contact-specific duplicate detection
- Error messages were inconsistent between the inline validation and the save handler

---

## Solution Implemented

### 1. Store-Level Enforcement (`src/store/appStore.ts`)

- Added `DuplicateCheckResult` interface with `isDuplicate`, `type` ("address" | "name" | "none"), and `message` fields
- Added `findDuplicateContact(name, publicKey, excludeId?)` — checks both address (blocking) and name (warning) duplicates with optional `excludeId` for future edit support
- Added `addContactIfUnique(contact)` — wraps `addContact` with an atomic duplicate check, returning a structured `DuplicateCheckResult` so the UI can provide clear feedback
- **Address is treated as the stronger duplicate identifier** (blocking save if address matches)
- **Name duplicates are non-blocking warnings** (user can save another contact with the same name but a different address)

### 2. Reusable Validation Utilities (`src/utils/validation.ts`)

- Added `ContactRecord` and `ContactValidationResult` interfaces
- Added `validateContactAddress(publicKey, contacts, excludeId?)` — standalone address duplicate check with `severity: 'error'`
- Added `validateContactName(name, contacts, excludeId?)` — standalone name duplicate check with `severity: 'warning'`
- Both functions accept an optional `excludeId` parameter for future contact editing support

### 3. UI Refactoring (`app/contacts.tsx`)

- Uses `findDuplicateContact` from the store for real-time inline validation on field change (replaces local `isDuplicateAddress`, `findExistingContactByAddress`, `findExistingContactByName`)
- Uses `addContactIfUnique` on save for a final atomic duplicate check (replaces manual duplicate check before calling `addContact`)
- Deduplicated error logic — validation and error messages are now consistent throughout
- Removed `normalizePublicKey` import (no longer needed in the UI layer)

### 4. Test & Mock Updates

- `src/store/__mocks__/appStore.ts` — updated to include `addContactIfUnique` and `findDuplicateContact` mocks
- `__tests__/contacts.scan.test.tsx` — updated `setupStore()` factory to mock new store actions with realistic duplicate-detection behavior

---

## Key Changes Made

| File                               | Change                                                                                                |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `src/store/appStore.ts`            | Added `DuplicateCheckResult` interface, `addContactIfUnique` action, `findDuplicateContact` helper    |
| `src/utils/validation.ts`          | Added `ContactRecord`, `ContactValidationResult`, `validateContactAddress()`, `validateContactName()` |
| `app/contacts.tsx`                 | Refactored to use centralized `findDuplicateContact` and `addContactIfUnique`; removed local helpers  |
| `src/store/__mocks__/appStore.ts`  | Added mocks for new store actions                                                                     |
| `__tests__/contacts.scan.test.tsx` | Updated store factory to support new actions                                                          |

---

## Trade-offs & Considerations

- **Backward compatibility**: The existing `addContact` action is preserved unchanged. `addContactIfUnique` is a new parallel action. Existing callers of `addContact` continue to work without modification.
- **Name duplicates are warnings, not errors**: This matches the issue acceptance criteria — names are not unique identifiers. The user is warned but not blocked.
- **Case-insensitive matching**: Both name and address comparisons use normalized (trimmed, uppercased/lowercased) matching to prevent accidental duplicates.
- **Future edit support**: Both store and validation functions accept an optional `excludeId` parameter for when contact editing is added in the future.
- **No GitHub Actions workflow found**: There is no `.github` directory in this repository, so CI checks could not be validated. Please ensure CI passes before merging.

---

## Testing Steps (How to Verify the Fix)

1. **Add a contact with a duplicate address**: Enter an address that already exists in your contacts → an inline error message is displayed saying "This address is already saved as 'Name'." → Save is blocked.
2. **Add a contact with a duplicate name (different address)**: Enter a name that already exists but with a different address → a warning message is displayed saying "You already have a contact named 'Name'. You can still save another with a different address." → Save is allowed.
3. **Scan a QR code for an existing contact**: Scan a QR code whose address is already saved → an alert is shown saying "Already saved" with the contact's name → returns to the contact list.
4. **Add a valid new contact**: Enter a unique name and a valid, unique address → contact saves successfully and returns to the list.
5. **Validation still works**: Empty name shows "Please enter a name." / Empty or invalid address shows appropriate validation errors.

---

**Please kindly review this task. If there are any corrections, improvements, adjustments, or merge conflicts that you notice regarding my implementation, I'd really appreciate your feedback. I'd also love to hear your overall review of my work on this branch. Thank you!**
