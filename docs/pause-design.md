# Savings Vault — Pause & Emergency Stop Design Research

> **Status:** Research / Design Proposal  
> **Scope:** Future Soroban smart contract versions  
> **Current State:** No pause mechanism exists in the mock vault  
> **Note:** This document explores trade-offs only — no implementation is planned in this issue.

---

## 1. Motivation

The Soroban Savings Vault contract manages user deposits, withdrawals, and (in future iterations) locking periods and yield accrual. In production on Stellar mainnet, a bug in contract logic, an oracle feed failure, or an upstream protocol vulnerability could put user funds at risk. A pause (circuit breaker) mechanism allows a designated party to halt critical state-changing functions temporarily, buying time to assess and remediate the issue.

### Scenarios Where Pause Could Be Useful

| Scenario | Why Pause Helps |
|---|---|
| **Contract logic bug discovered** (e.g., integer overflow in yield calculation) | Prevents exploitation while a patched contract is deployed and migration is prepared. |
| **Oracle / price-feed failure** | If the vault uses an external price oracle for yield or collateral calculations, a stale or manipulated feed could cause incorrect deposits/withdrawals. |
| **Upstream protocol issue** (e.g., Stellar network halt, Soroban host function vulnerability) | Protects vault state from being altered during uncertain network conditions. |
| **Governance takeover or admin key compromise** | A time-limited pause can prevent an attacker who gained admin access from draining funds immediately, if combined with a timelock. |
| **Regulatory or compliance event** | In jurisdictions where the operator must halt activity pending legal review, a pause can demonstrate compliance capability. |
| **Smooth contract upgrade / migration** | Pausing deposits and withdrawals ensures a consistent snapshot of state before migrating to a new contract version. |

---

## 2. Scope: Which Functions Could Be Paused

The vault's state-changing functions can be grouped into tiers of pause granularity:

### Tier 1 — Full Pause (Emergency Stop)

A single flag (`paused: bool`) that, when set, reverts **all** state-mutating invocations:

- `deposit()` — prevent new deposits
- `withdraw()` — prevent withdrawals (including partial)
- `lock()` / `unlock()` — prevent lock-state changes (if locking is added)
- `transfer_vault_ownership()` — prevent admin transfers (if applicable)
- `claim_yield()` / `harvest()` — prevent yield claims

**Read-only / view functions remain operational** so users can verify their balances and vault state.

### Tier 2 — Granular Pause Flags

Per-function or per-category flags that allow surgical intervention:

| Flag | Controls |
|---|---|
| `deposits_paused` | Only `deposit()` |
| `withdrawals_paused` | Only `withdraw()` |
| `locks_paused` | `lock()` and `unlock()` |
| `yield_paused` | `claim_yield()` / `harvest()` |
| `transfers_paused` | Ownership / role transfers |

**Trade-off:** Granular flags add storage cost and complexity to the contract. For a first version, a single global pause flag is simpler and adequate for most emergencies. Granularity can be added in later upgrades.

---

## 3. Admin Authority: Who Can Trigger the Pause

### Option A — Single Admin Key

- **Model:** One Stellar keypair (the contract deployer or a designated admin) can call `pause()` and `unpause()`.
- **Pros:** Simple to implement. Low latency in emergencies.
- **Cons:** Single point of failure. If the admin key is lost, pause cannot be toggled. If compromised, the attacker can pause indefinitely (griefing) or unpause after a malicious action.

### Option B — Multi-Signature (M-of-N)

- **Model:** N authorized signers; M signatures required to pause/unpause. Implemented via Soroban's `require_auth_for_args` or a custom multi-sig module.
- **Pros:** Eliminates single point of failure. Aligns with Stellar's multi-sig account model.
- **Cons:** Higher latency in emergencies (coordination overhead). More complex contract logic and higher transaction fees due to multiple signatures.

### Option C — Timelock-Protected Admin

- **Model:** A single admin can pause immediately, but **unpausing** requires a timelock (e.g., 24–72 hours) with an event emitted so users can exit before unpause takes effect.
- **Pros:** Prevents "pause → drain → unpause → run" attack by a compromised admin. Gives users a window to react.
- **Cons:** Delays recovery after a legitimate fix is deployed.

### Option D — Governance DAO

- **Model:** A DAO of vault depositors or token holders votes to pause/unpause.
- **Pros:** Fully decentralized; no central authority.
- **Cons:** Impractical for emergency response — governance cycles are too slow (days to weeks).

### Recommendation for Initial Mainnet Version

Start with **Option A (single admin key)** for simplicity, but pair it with **Option C (timelock on unpause)** . Document the admin key rotation procedure. Plan for migration to **Option B (multi-sig, e.g., 2-of-3)** in a follow-up release once the contract is stable.

---

## 4. Abuse Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **Admin pauses indefinitely (griefing / ransom)** | High | Timelock on unpause; event emission so users can verify on-chain. Optional: maximum pause duration after which unpause auto-triggers. |
| **Admin pauses → front-runs withdrawals → unpauses** | High | Timelock on unpause; combine pause with a cooldown on large withdrawals. |
| **Admin unpauses during active exploit** | Critical | Multi-sig requirement for unpause; community monitoring of pause events. |
| **Pause blocks legitimate emergency withdrawals** | Medium | Provide an `emergency_withdraw()` function that bypasses pause but sends funds only to the depositor's pre-registered address (prevents theft, allows exit). |
| **Pause flag storage collision** | Low | Use a dedicated `DataKey` enum variant; Soroban's storage isolation prevents accidental collision. |
| **Re-entrancy via pause** | Low | Pause check should be the **first** operation in each function, before any external calls or token transfers. |

---

## 5. Recovery Process

A well-defined recovery playbook is essential. The pause mechanism is only as good as the operational process around it.

```mermaid
flowchart TD
    A[Incident Detected] --> B{Severity Assessment}
    B -->|Critical| C[Admin calls pause()]
    B -->|Non-critical| D[Monitor & prepare fix]
    C --> E[Event emitted: VaultPaused]
    E --> F[Users notified via dApp UI & social channels]
    F --> G[Root cause analysis]
    G --> H{Fix identified?}
    H -->|Yes| I[Deploy fix / migration contract]
    H -->|No| J[Consider permanent shutdown & fund recovery]
    I --> K[Timelock countdown begins]
    K --> L[Users may exit via emergency_withdraw if available]
    L --> M[Timelock expires]
    M --> N[Admin (or multi-sig) calls unpause()]
    N --> O[Event emitted: VaultUnpaused]
    O --> P[Normal operation resumes]
```

### Key Recovery Principles

1. **Communicate early and often.** Use Stellar events + off-chain channels (Twitter, Discord, dApp UI banner).
2. **Never rush unpause.** The timelock exists specifically to prevent that.
3. **Provide an escape hatch.** An `emergency_withdraw()` that works even when paused, returning the user's exact deposited balance (minus any yield), ensures users are never trapped.
4. **Post-mortem.** Publish a transparent post-mortem after every pause incident.

---

## 6. Alternatives to a Pause Mechanism

Before committing to an on-chain pause, consider these alternatives:

| Alternative | Description | Trade-off |
|---|---|---|
| **Circuit breaker on volume** | Automatically halt if deposit/withdrawal volume exceeds a threshold within a time window. | No admin needed, but can trigger false positives. |
| **Rate limiting** | Limit max deposit/withdrawal per user per epoch. | Mitigates drain attacks without full stop. Does not help with logic bugs. |
| **Upgradeable contract pattern** | Deploy vault logic behind a proxy; upgrade to fix bugs. | Soroban does not natively support delegate-call proxies like EVM. Would require a custom dispatch contract. Adds complexity. |
| **Withdrawal delay (built-in)** | All withdrawals have a mandatory N-day delay. During that window, admin can freeze the specific withdrawal if an exploit is detected. | Protects against unauthorized withdrawals without global pause. Does not protect deposits. |
| **Insurance / cover fund** | Instead of pausing, rely on a protocol insurance fund to make users whole after an incident. | Only addresses financial loss, not ongoing exploitation. |
| **Do nothing (trust immutability)** | Accept that contracts are immutable and bugs are a known risk. Rely on audits and formal verification. | Philosophically pure but high-risk for a savings product holding user funds. |

### Recommendation

A **pause mechanism + emergency withdrawal escape hatch** provides the best balance of safety and user protection. Rate limiting can be added as a complementary, non-admin defense.

---

## 7. Soroban-Specific Implementation Notes

### Storage Pattern

Use a dedicated `DataKey` enum variant in the contract's storage:

```rust
enum DataKey {
    Admin,
    Paused,
    // ... other keys
}
```

The `Paused` key stores a `bool`. Read from storage once per invocation (cheap in Soroban — storage is metered but reads are low-cost compared to host functions).

### Auth Consideration

Use `env.current_contract_address()` combined with `require_auth()` to verify the caller is the admin before allowing `pause()` or `unpause()`.

### Event Emission

Soroban supports `env.events().publish()` for emitting structured events. Emit on every pause/unpause:

```rust
env.events().publish(
    (symbol_short!("pause"),),
    (symbol_short!("vault_paused"), admin_address),
);
```

These events are indexed by Soroban RPC and can be queried by off-chain monitors and the dApp UI.

### Gas & Fee Impact

- A single `bool` storage read adds negligible cost (~hundreds of CPU instructions).
- The pause check should be the first line in each gated function to fail cheaply.
- Multi-sig verification is significantly more expensive and should be considered carefully.

---

## 8. Open Questions

1. **Should `emergency_withdraw` bypass pause?** If yes, under what constraints? Should it return only principal (no yield)? Should it have its own rate limit?

2. **What is the appropriate timelock duration for unpause?** 24 hours? 72 hours? This depends on the expected user base and their ability to react. Too short → users can't exit. Too long → legitimate recovery is delayed.

3. **Should there be a maximum total pause duration?** After N days, should the contract auto-unpause or enter a "permanent shutdown" mode where only withdrawals are allowed?

4. **Can the admin role be rotated?** A two-step admin transfer (nominate → accept) is recommended to prevent accidental loss of admin capability.

5. **How do we handle the pause mechanism during contract migration?** If the vault is upgraded to a new contract, should the pause state carry over, or should the new contract start unpaused?

6. **Does the pause affect yield accrual?** If the vault is paused for an extended period, should yield continue to accrue on deposited funds, or should it be frozen?

7. **Multi-chain or cross-contract considerations?** If the vault interacts with other Soroban contracts (e.g., a lending pool or DEX), does pausing the vault create composability risks for those protocols?

8. **Should the front-end (PocketPay mobile app) detect on-chain pause state?** The dApp should display a clear warning banner when the vault is paused and disable deposit/withdraw buttons. This requires polling or subscribing to Soroban events.

9. **Can the pause be tested on Testnet before mainnet?** A testnet deployment with simulated pause scenarios (including abuse scenarios) should be part of the pre-mainnet checklist.

10. **Is a pause mechanism compatible with the goal of full decentralization?** If the long-term vision is a fully trustless vault, the pause mechanism (and admin role) should be designed to be removable via governance once the contract has been battle-tested for a sufficient period.

---

## 9. Summary & Recommendation

| Aspect | Recommendation |
|---|---|
| **Implement pause?** | Yes, for mainnet-oriented versions |
| **Scope** | Single global `paused` flag affecting all state-mutating functions |
| **Admin model** | Single admin key initially; migrate to 2-of-3 multi-sig |
| **Unpause protection** | Mandatory timelock (suggest 48h) |
| **Escape hatch** | `emergency_withdraw()` returning principal, usable during pause |
| **Events** | Emit on pause, unpause, and emergency withdrawal |
| **Front-end** | PocketPay app reads pause state and shows prominent warning |

The pause mechanism should be treated as a **temporary safety net**, not a permanent control lever. The long-term goal should be to remove or community-govern the admin role once the contract has undergone sufficient audits, formal verification, and real-world battle-testing.

---

## References

- [Soroban Smart Contract SDK Documentation](https://sdk.docs.stellar.org/)
- [Stellar Smart Contract Security Best Practices](https://developers.stellar.org/docs/smart-contracts/guides/soroban-security)
- [EIP-3156: Pausable Token Standard](https://eips.ethereum.org/EIPS/eip-3156) — Inspiration from the Ethereum ecosystem
- [OpenZeppelin Pausable Contract](https://docs.openzeppelin.com/contracts/5.x/api/utils#Pausable) — Reference implementation pattern
- [Stellar Community Fund Guidelines](https://communityfund.stellar.org/)
