import { VaultLock } from '../../src/types/vault';

/**
 * Placeholder vault lock data for development and testing.
 *
 * These fixtures simulate three typical lock states:
 *   - locked (immature, still waiting for unlock date)
 *   - matured (ready to withdraw)
 *   - withdrawn (already claimed)
 *
 * In production, this data will be fetched from the Soroban vault contract's
 * on-chain lock registry. Until contract integration is ready, these fixtures
 * provide representative data for UI development.
 */
export const vaultLockFixtures: {
  /** A full set of three locks covering all statuses. */
  all: VaultLock[];
  /** Only immature locks. */
  locked: VaultLock[];
  /** Only matured locks. */
  matured: VaultLock[];
  /** Empty state for testing. */
  empty: VaultLock[];
} = {
  all: [
    {
      id: 'lock-001',
      amount: '500.0000000',
      unlockDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      status: 'locked',
      txHash: 'abc123def456',
    },
    {
      id: 'lock-002',
      amount: '250.0000000',
      unlockDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      status: 'matured',
      txHash: 'ghi789jkl012',
    },
    {
      id: 'lock-003',
      amount: '100.0000000',
      unlockDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
      status: 'withdrawn',
      txHash: 'mno345pqr678',
    },
  ],
  locked: [
    {
      id: 'lock-001',
      amount: '500.0000000',
      unlockDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'locked',
    },
    {
      id: 'lock-004',
      amount: '75.0000000',
      unlockDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'locked',
    },
  ],
  matured: [
    {
      id: 'lock-002',
      amount: '250.0000000',
      unlockDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'matured',
    },
    {
      id: 'lock-005',
      amount: '1000.0000000',
      unlockDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'matured',
    },
  ],
  empty: [],
};
