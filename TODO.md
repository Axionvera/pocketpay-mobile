# Contact Duplicate Detection — Implementation Plan

## Steps

- [x] Analyze codebase and confirm plan with user
- [x] **Step 1**: `src/store/appStore.ts` — Add `findContactByName` method + interface
- [x] **Step 2**: `app/contacts.tsx` — Add name duplicate detection, refactor to use `normalizePublicKey`
- [x] **Step 3**: `src/store/__mocks__/appStore.ts` — Add `findContactByPublicKey` and `findContactByName` to mock
- [x] **Step 4**: Tests — Already covered by existing AC4 tests; no new tests needed since name dedup uses inline warning (not blocking)
- [ ] **Step 5**: Generate PR description
