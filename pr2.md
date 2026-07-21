**Close:** # (I'll add the issue number here)

---

## Summary of the Issue

When the app loses network connectivity, users may not understand why balances, transactions, or payment actions fail. There is no visible offline indicator, so users may think the app is broken rather than understanding they need to reconnect.

---

## Root Cause

The existing `useNetworkStatus` hook and `NetworkStatusBanner` component are **reactive** — they only trigger after an API error has occurred and been classified. This means:

- There is no **proactive** real-time online/offline detection
- Users see no banner until they attempt an action that fails
- The app relies on wallet store error strings, which may not always be present

---

## Solution Implemented

### 1. New Hook: `useOnlineStatus` (`src/hooks/useOnlineStatus.ts`)

A lightweight, dependency-free hook that proactively monitors network connectivity:

- Periodically fetches a reliable endpoint (Cloudflare DNS at `https://1.1.1.1`) with a 5-second timeout
- Polls every 30 seconds by default (configurable via `pollInterval` option)
- Immediately checks connectivity when the app returns to the foreground (via `AppState` listener)
- Returns `{ isOnline, isChecking, checkNow }` — the caller can also trigger a manual check
- No extra native dependencies required

### 2. New Component: `OfflineBanner` (`src/components/OfflineBanner.tsx`)

A reusable, theme-aware offline indicator:

- Displays a simple, non-technical message: _"You are offline. Some features may not work until you reconnect."_
- Uses `useOnlineStatus` by default, but accepts an optional `isOnline` prop for manual/parent-driven control
- Renders nothing when online (zero UI footprint)
- Does **not** block any read-only cached screens or prevent user interaction
- Accessibility: uses `accessibilityRole="alert"` so screen readers announce offline state

### 3. Integration: Tab Layout (`app/(tabs)/_layout.tsx`)

- Wraps the tab navigator in a `View` and renders `<OfflineBanner />` at the top
- The banner appears on all main screens (Home, Activity, Vault, Settings)
- Wraps existing `Tabs` in a `View` for proper layout

### 4. Exports

- `src/hooks/index.ts` — exports `useOnlineStatus`
- `src/components/index.ts` — exports `OfflineBanner`

### 5. Tests (`__tests__/OfflineBanner.test.tsx`)

- AC-OB1: Banner is not rendered when online
- AC-OB2: Banner is rendered when offline
- AC-OB3: Banner displays a non-technical, user-friendly message
- AC-OB4: The component is reusable with manual `isOnline` prop control
- AC-OB5: Does not block or prevent access to the rest of the UI

---

## Key Changes Made

| File                               | Change                                                         |
| ---------------------------------- | -------------------------------------------------------------- |
| `src/hooks/useOnlineStatus.ts`     | **New** — Lightweight connectivity hook using fetch + AppState |
| `src/components/OfflineBanner.tsx` | **New** — Reusable offline banner component                    |
| `app/(tabs)/_layout.tsx`           | Integrate `OfflineBanner` at the top of the tab layout         |
| `src/hooks/index.ts`               | Export `useOnlineStatus`                                       |
| `src/components/index.ts`          | Export `OfflineBanner`                                         |
| `__tests__/OfflineBanner.test.tsx` | **New** — Tests for all acceptance criteria                    |

---

## Trade-offs & Considerations

- **No extra native dependencies**: Uses `fetch` with `AbortController` and `AppState` instead of installing `@react-native-community/netinfo`. This keeps the bundle size small and avoids a native module linking step.
- **Proactive vs reactive**: Unlike the existing `useNetworkStatus` (which reacts to wallet errors), `useOnlineStatus` proactively checks connectivity. The two are complementary — the error-based banner catches service-specific issues, while the offline banner catches general connectivity loss.
- **Polling interval**: 30 seconds balances battery life with responsiveness. The foreground listener ensures near-instant detection when the user returns to the app.
- **Simple message**: The banner uses plain language ("You are offline") rather than technical jargon like "Network request failed" or "ECONNRESET".

---

## Testing Steps (How to Verify the Fix)

1. **Normal state (online)**: Launch the app with normal connectivity → no banner is displayed.
2. **Offline detection**: Disable network connectivity (airplane mode) → the offline banner appears at the top of all tab screens within ~5 seconds, showing "You are offline. Some features may not work until you reconnect."
3. **Returning online**: Re-enable network connectivity → the banner disappears within ~5 seconds (or immediately when app returns to foreground).
4. **App foreground**: While offline, background the app, re-enable Wi-Fi, then foreground the app → the banner disappears quickly.
5. **Does not block UI**: The banner is purely visual. All read-only cached screens (e.g., transaction history, contact list) remain fully accessible and interactive while the banner is shown.

---

**Please kindly review this task. If there are any corrections, improvements, adjustments, or merge conflicts that you notice regarding my implementation, I'd really appreciate your feedback. I'd also love to hear your overall review of my work on this branch. Thank you!**
