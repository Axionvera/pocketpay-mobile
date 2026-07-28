# Evaluation Readiness Checklist

## Purpose

This checklist is for GrantFox contributors working on contract issues. Use it before the payment evaluation period begins.

> Merging a contract PR does **not** guarantee payment approval. Approval still depends on evaluator review, passing checks, adequate tests, issue compliance, and overall implementation quality.

## When To Use This Checklist

- Before requesting final review on a contract issue PR
- Before the payment evaluation period starts
- After every substantial code, test, or scope update

## Evaluation Readiness

### 1. Issue Requirements

- [ ] I re-read the linked issue and matched the requested scope exactly.
- [ ] I confirmed the implementation satisfies the issue acceptance criteria.
- [ ] I documented any intentional scope limits, assumptions, or follow-up work in the PR.
- [ ] I verified the contract behavior matches the expected user or protocol outcome.
- [ ] I removed unfinished work, placeholders, dead code, and misleading TODOs that could affect evaluation.

### 2. Contract Correctness

- [ ] I reviewed all changed contract paths for happy-path correctness.
- [ ] I reviewed failure paths and verified the contract rejects invalid inputs safely.
- [ ] I checked authorization, signer, and caller assumptions.
- [ ] I confirmed state transitions are valid before and after each write.
- [ ] I verified arithmetic, rounding, overflow/underflow, and precision-sensitive logic.

### 3. Tests

- [ ] I added or updated tests for the main behavior introduced by the issue.
- [ ] I added regression coverage for the bug or edge case that motivated the change.
- [ ] I covered both success and failure paths where the contract can branch.
- [ ] I verified test fixtures and mocks still reflect real contract expectations.
- [ ] I confirmed the tests would help an evaluator understand why the change is correct.

### 4. CI And Verification

- [ ] All required CI checks pass on the PR.
- [ ] Local test commands for the affected contract area pass before review.
- [ ] Any lint, formatting, type, or static-analysis checks required by the repo pass.
- [ ] I did not ignore, mute, or bypass failing checks to get the PR merged.
- [ ] I included clear verification notes in the PR description.

### 5. Security Review

- [ ] I reviewed access control and confirmed only authorized actors can trigger privileged behavior.
- [ ] I checked for unsafe assumptions around external inputs, contract calls, and user-provided values.
- [ ] I reviewed replay, duplicate execution, and unexpected re-entry or repeated-call scenarios where relevant.
- [ ] I confirmed sensitive operations fail safely and leave the contract in a valid state.
- [ ] I verified there are no debug shortcuts, test-only bypasses, or insecure defaults left in the change.

### 6. Edge Cases

- [ ] I tested zero, minimum, maximum, empty, and invalid input cases where applicable.
- [ ] I reviewed boundary conditions for timestamps, counters, balances, and collection sizes.
- [ ] I checked behavior when preconditions are missing or previous state is inconsistent.
- [ ] I verified error messages or failure reasons remain clear enough for maintainers to evaluate quickly.
- [ ] I considered upgrade, migration, or compatibility risks if the issue touches persisted state or interfaces.

### 7. Self-Review

- [ ] I reviewed the full diff as if I were the evaluator.
- [ ] I removed unrelated changes that could make the issue harder to evaluate.
- [ ] I made sure naming, comments, and documentation explain non-obvious contract behavior.
- [ ] I confirmed the PR description links the issue and explains what was tested.
- [ ] I am confident the work is ready for evaluation even if I am not available to clarify it live.

## Final Reminder

Before the payment evaluation period starts, make sure the PR is fully reviewable on its own:

- [ ] The implementation matches the issue requirements.
- [ ] Tests and CI are passing.
- [ ] Security and edge cases were reviewed.
- [ ] Acceptance criteria were checked one by one.
- [ ] The PR is evaluator-ready.

If any box is still unchecked, treat the work as not yet ready for payment evaluation.
