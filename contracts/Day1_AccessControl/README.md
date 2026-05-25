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