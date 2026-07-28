/**
 * useNetworkState
 *
 * Unified hook that combines HTTP reachability checks (useOnlineStatus) with
 * post-hoc error classification (useNetworkStatus) to derive a single
 * NetworkState value.
 *
 * State resolution:
 *   1. Device offline (useOnlineStatus.isOnline === false) → 'offline'
 *   2. Device online + service error pattern → 'service-unavailable'
 *   3. Device online + offline error pattern → 'degraded' (Horizon unreachable)
 *   4. Device online + no error → 'online'
 *   5. Still checking + no error → 'unknown'
 *
 * Usage:
 * ```tsx
 * // Global (tabs layout) — no error string needed, uses connectivity check only
 * const { state, retry } = useNetworkState();
 *
 * // Per-screen — pass the wallet store error for service classification
 * const { state, disableWriteActions, retry } = useNetworkState({ error });
 * ```
 */

import { useMemo } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { classifyNetworkError } from './useNetworkStatus';
import type { NetworkState } from '../types/network';

export interface UseNetworkStateResult {
  /** The derived network state. */
  state: NetworkState;
  /** Whether write-actions (send, vault deposit) should be disabled. */
  disableWriteActions: boolean;
  /** Manually trigger a connectivity re-check. */
  retry: () => void;
  /** True while a connectivity check is in flight. */
  isChecking: boolean;
  /** True if the device appears to have internet connectivity. */
  isOnline: boolean;
}

interface UseNetworkStateOptions {
  /**
   * The wallet store error string. When provided, the hook uses it to
   * distinguish between service-unavailable and degraded states.
   * Without it, the hook can only detect online/offline/unknown.
   */
  error?: string | null;
  /** Override the default polling interval for useOnlineStatus (ms). */
  pollInterval?: number;
}

const WRITE_ACTION_DISABLING_STATES: ReadonlySet<NetworkState> = new Set([
  'offline',
  'service-unavailable',
]);

export function useNetworkState(
  options?: UseNetworkStateOptions,
): UseNetworkStateResult {
  const { isOnline, isChecking, checkNow } = useOnlineStatus(
    options?.pollInterval !== undefined
      ? { pollInterval: options.pollInterval }
      : undefined,
  );

  const state = useMemo<NetworkState>(() => {
    // 1. Device offline → offline
    if (!isOnline) return 'offline';

    // 2. Device online — check for service-level errors
    if (options?.error) {
      const errorType = classifyNetworkError(options.error);
      if (errorType === 'service-unavailable') return 'service-unavailable';
      if (errorType === 'offline') return 'degraded';
    }

    // 3. Device online, no error → online
    if (!isChecking) return 'online';

    // 4. Still checking → unknown
    return 'unknown';
  }, [isOnline, isChecking, options?.error]);

  return {
    state,
    disableWriteActions: WRITE_ACTION_DISABLING_STATES.has(state),
    retry: checkNow,
    isChecking,
    isOnline,
  };
}
