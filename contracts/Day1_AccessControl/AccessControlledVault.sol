// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract AccessControlledVault {
    // Owner address
    address public owner;

    // Rate variable 
    uint256 public conversionRate;

    // Custom error for gas optimization
    error NotAnOwner();

    // Event emitted when the rate changes
    event RateChanged(uint256 newRate);

    // Constructor to set the owner and initial conversion rate
    // 🏗️ 1. Write the constructor that sets the deployer as the owner
    constructor() {
        owner = msg.sender;
    }

    // 🛡️ 2. Modifier using custom error instead of require
    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotAnOwner();
        }
        _;
    }

    // ⚙️ 3. Apply the modifier and emit the event
    function setRate(uint256 _newRate) public onlyOwner {
        conversionRate = _newRate;
        emit RateChanged(_newRate);
    }
}