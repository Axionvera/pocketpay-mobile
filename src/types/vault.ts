/**
 * Vault lock types for the multi-lock feature.
 *
 * A "lock" represents a time-locked deposit in the Soroban vault contract.
 * Locks mature after their unlock date and can then be withdrawn.
 */

/** Status lifecycle of a vault lock. */
export type LockStatus = 'locked' | 'matured' | 'withdrawn';

/** A single time-locked deposit in the vault. */
export interface VaultLock {
  /** Unique identifier for this lock (on-chain lock index or generated id). */
  id: string;
  /** Amount locked, denominated in XLM as a 7-decimal string (e.g. "100.0000000"). */
  amount: string;
  /** ISO-8601 date string when the lock matures and becomes withdrawable. */
  unlockDate: string;
  /** Current status of the lock. */
  status: LockStatus;
  /** Optional transaction hash that created this lock. */
  txHash?: string;
}
