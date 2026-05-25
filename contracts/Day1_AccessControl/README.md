# Day 1: Access Control & Vault Management

## ❌ Problem
By default, all functions in a deployed smart contract are public. If critical administrative actions—such as changing rates, updating whitelists, or withdrawing funds—are left unprotected, any user on the blockchain can execute them and take control of the contract.

## 💡 Solution
We implemented an ownership pattern in `AccessControlledVault.sol`. 
* **Constructor Initialization**: The deploying address is automatically captured via `msg.sender` and stored as the `owner`.
* **Custom Modifiers**: We created an `onlyOwner` modifier that restricts execution by checking if `msg.sender == owner`.
* **Gas Optimization**: Instead of using standard `require` strings, we used custom errors (`error NotAnOwner()`) combined with an `if` statement to significantly reduce gas consumption during execution revert states.

## 🧠 Key Concepts Learned
* `constructor` — code that runs exactly once upon deployment.
* `msg.sender` — a global variable representing the address invoking the current transaction.
* `modifier` — reusable code wrappers used to alter the behavior of functions.
* Custom Errors — gas-efficient alternatives to revert strings available in Solidity ^0.8.0.
### 🧠 Deep-Dive: Solidity Modifiers as Compile-Time Macros vs. C# Dynamic Attributes

For a developer with a .NET background, a Solidity `modifier` looks deceptively similar to a C# **Action Filter** in ASP.NET Core or a standard Attribute (e.g., `[Authorize]`). However, under the hood, their execution models are polar opposites:

* **The .NET Way (Dynamic Reflection):** In C#, attributes are metadata. The runtime reads this metadata via Reflection, evaluates it dynamically, and routes the request through a shared middleware pipeline or filter provider. The compiler builds the code for `[Authorize]` exactly once, regardless of how many controllers use it.
* **The Solidity Way (AST Code Inlining):** Solidity handles modifiers during compilation using the **Abstract Syntax Tree (AST)**. The compiler literally takes the code inside the modifier and copies it directly into the target function, replacing the `_;` symbol with the function's internal body. It works exactly like a **compile-time macro** or dynamic code injection (`#define` macros in C++).

#### ⚠️ The Contract Size Limit Trap (EIP-170)
Because modifiers use pure inlining, every time you append `onlyOwner` to a function, the EVM bytecode of that check is duplicated. 

If your modifier contains complex logic (e.g., multiple `require` statements, string allocation, or state lookups), and you apply it to 15-20 functions, your compiled bytecode will swell exponentially. Ethereum enforces a strict maximum bytecode size of **24,576 bytes (EIP-170)**. Exceeding this limit prevents deployment.

**Architectural Takeaway:** To avoid bloating the contract size, heavy authorization logic should be refactored from internal modifier code into a separate, non-inlined internal function:

```solidity
// Avoid this if logic is heavy:
modifier heavyCheck() {
    require(msg.sender == owner, "Error message 1...");
    require(isActive, "Error message 2...");
    _;
}

// Do this instead to minimize bytecode replication:
function _validateAccess() internal view {
    require(msg.sender == owner, "Error message 1...");
    require(isActive, "Error message 2...");
}

modifier optimizedCheck() {
    _validateAccess(); // Only the internal function jump is inlined
    _;
}