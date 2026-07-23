# Vault Integration Assumptions

This document outlines the core integration assumptions, expected dependencies, placeholder behaviors, and known gaps between the PocketPay Mobile wallet client, the [PocketPay SDK](https://github.com/Axionvera/pocketpay-sdk), and the [PocketPay Contracts](https://github.com/Axionvera/pocketpay-contracts) repository.

---

## 1. Expected SDK and Contract Dependencies

The PocketPay Mobile client depends on the following external behavior and interfaces:

### Deployed Contract Interface
The Soroban Savings Vault smart contract is assumed to expose the following functions:
- `deposit(from: Address, amount: i128)`: Initiates a deposit of Stellar XLM tokens (specified in stroops, where \(1\text{ XLM} = 10,000,000\text{ stroops}\)) from the user's address to the vault.
- `withdraw(to: Address, amount: i128)`: Withdraws unlocked/matured XLM tokens from the vault to the specified address.
- `balance(id: Address) -> i128`: Returns the total balance (both locked and unlocked) managed by the vault for the given address.
- `get_locks(id: Address) -> Vec<Lock>`: Returns all active/historical time-locks for the user address.
- `unlock(id: Address, lock_id: u64)`: Unlocks or matures a specific lock when its lock duration has passed.

### SDK Helper Methods
The PocketPay SDK helper library is expected to wrap contract interactions and expose:
- `isVaultConfigured()`: Boolean utility to check configuration.
- `getVaultContractId()`: Retrieves the current contract ID.
- `getVaultBalance(publicKey)`: Simulates the `balance` query on-chain.
- `depositToVault(secretKey, amount)`: Builds, signs, and submits a `deposit` transaction.
- `withdrawFromVault(secretKey, amount)`: Builds, signs, and submits a `withdraw` transaction.
- `getUserLocks(publicKey)`: Returns the array of locks.
- `unlockMaturedLock(secretKey, lockId)`: Invokes the `unlock` method for a matured lock.

---

## 2. Placeholder Behavior

To ensure the app remains testable and runs in a demo environment without contract deployment, the mobile client implements several local placeholders:

| Feature Area | Mock/Placeholder Behavior | Production (Target) Behavior |
| :--- | :--- | :--- |
| **Lock Storage** | Stored in client-side local storage using `AsyncStorage`. | Fetched dynamically from the contract using `get_locks`. |
| **Unlock Calculation** | Relies on the client device's local system clock. | Relies on the network consensus ledger time (ledger close time). |
| **Vault Balance** | Mock balance state (persisted locally, starting at 0). | Real balance queried dynamically via simulation of the contract's `balance` function. |
| **Transaction Processing** | No real transactions are compiled or submitted to the Stellar network. | Real transactions are built, signed with the local secret key, and submitted via Soroban RPC. |
| **Lock Duration** | Hardcoded to a fixed **30-day lock period** in the UI. | Defined by the contract configurations or custom parameters passed during locking. |

---

## 3. Known Gaps and Risks

Below are the identified gaps and risks that require coordination across repositories before production deployment:

### Schema Divergence
- **Risk**: The lock data structure (amount, lock period, start time, unique identifier format) in the contract may change or differ from the mobile model (`id`, `amount`, `unlockDate`, `status`, `createdAt`).
- **Mitigation**: Define a shared JSON/TypeScript/Rust schema to generate matching structures.

### Ledger vs. Device Time
- **Risk**: Users could change their mobile device time to artificially trigger lock maturation in the UI, leading to failed transactions when the Soroban contract enforces true ledger time on-chain.
- **Mitigation**: The UI must display status based on estimated ledger time, or check maturity by simulating the `unlock` transaction before attempting submission.

### RPC Stability & Errors
- **Risk**: Soroban RPC nodes may return complex or cryptic simulation/execution error codes. Showing these raw codes directly to users leads to a poor user experience.
- **Mitigation**: Develop an SDK-level error parser that maps common Soroban/Stellar transaction codes to localized, human-friendly error messages (e.g. "Insufficient funds", "Lock has not matured").

### Fee Escalation and Gas Fees
- **Risk**: Network fee estimation for Soroban transactions might exceed standard Stellar transaction fees under network load.
- **Mitigation**: The SDK must dynamically estimate resource footprints and assign appropriate maximum fees prior to user approval in the UI.

---

## Related Documentation

- [Vault UI Guidance](./vault-ui-guidance.md) - Wording, Testnet constraints, and balance limitation details
- [Vault Integration Risks](./vault-integration-risks.md) - Deep dive into risk analysis and contract simulation mechanics
