# Day 4: Token Standards & Fixed-Point Money Mechanics (MyToken & ICO)

### ❌ The Problem
In distributed corporate applications, we represent ecosystem value or user balance using traditional internal databases or standard JWT claims (e.g., passing loyalty points via encrypted bearer properties). In a decentralized ecosystem, asset ledger tracking must be entirely self-contained, trustless, and interoperable with external decentralized exchanges (DEXs) and wallets.

Furthermore, implementing financial math in a language with no floating-point primitives (`float` or `double`) presents a massive operational hazard. Naive truncation and rounding errors can lead to capital leakage or total structural imbalances.

### 🦖 Enterprise .NET Perspective: OAuth2 Bearer Claims vs. ERC-20 Allowances
Coming from a Web2 enterprise architecture background, managing third-party access to resources is typically handled via dynamic **OAuth2 delegated grants** or short-lived token introspection patterns. 

In the EVM, the standard **ERC-20 interface** mimics this delegated access pattern natively via the `approve` and `transferFrom` mechanics:
* **The Granular Delegation:** Calling `approve(spender, amount)` is the architectural equivalent of issuing an OAuth2 scoped token. It explicitly registers an external address (`spender`) to act as a proxy actor for your assets up to a strict limit inside the `allowance` mapping.
* **The Core Invariant:** Value never leaves the master ledger (`balanceOf`). The authorized contract merely queries this registry during operations, providing a decentralized, state-based authorization framework.

### ⛽ Architectural Safeguards: Fixed-Point Scaling & Hardcap Invariants
1. **The Math Paradigm:** To eliminate rounding bugs without a `decimal` primitive, the EVM operates exclusively on standard atomic units (**wei**). Both ETH and our `MyToken` utilize a scale factor of **18 decimals** ($10^{18}$). 
2. **Execution Sequencing:** All arithmetic formulas must enforce structural order-of-operations: **always multiply before dividing**. This contains execution truncation strictly within negligible fractions of a single wei unit.
3. **The Crowdsale Allocation Trap:** When a token contract combines initial pre-mints with crowdsale mechanics (ICO), checking limits against global metrics like `totalSupply()` can inadvertently lock up intended fundraising targets. An explicit ledger counter tracking localized ICO distributions (`totalRaised`) is the correct architectural pattern to ensure strict separation of operational pre-mints from public crowd allocations.