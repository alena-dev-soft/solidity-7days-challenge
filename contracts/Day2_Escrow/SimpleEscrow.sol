// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SimpleEscrow {
    // Custom errors for gas optimization
    error OnlyArbiter();
    error InvalidState();
    error TransferFailed();
    error NothingToWithdraw();

    enum State { AwaitingPayment, AwaitingDelivery, Completed, Refunded }

    address public immutable buyer;
    address public immutable seller;
    address public immutable arbiter;
    
    uint256 public immutable amount;
    State public currentState;

    // Mapping to track pull-payments balance
    mapping(address => uint256) public balanceOf;

    event Deposited(address indexed buyer, uint256 amount);
    event Released();
    event RefundedToBuyer();
    event Withdrawn(address indexed payee, uint256 amount);

    modifier onlyArbiter() {
        if (msg.sender != arbiter) revert OnlyArbiter();
        _;
    }

    constructor(address _seller, address _arbiter, uint256 _amount) {
        buyer = msg.sender;
        seller = _seller;
        arbiter = _arbiter;
        amount = _amount;
        currentState = State.AwaitingPayment;
    }

    /**
     * @notice Buyer deposits the fixed escrow amount.
     */
    function deposit() external payable {
        if (msg.sender != buyer) revert InvalidState();
        if (currentState != State.AwaitingPayment) revert InvalidState();
        if (msg.value != amount) revert InvalidState();

        currentState = State.AwaitingDelivery;
        emit Deposited(buyer, msg.value);
    }

    /**
     * @notice Arbiter confirms delivery and unlocks funds for the seller (Pull allocation).
     */
    function release() external onlyArbiter {
        if (currentState != State.AwaitingDelivery) revert InvalidState();

        currentState = State.Completed;
        
        // 🛠️ TODO: Fill the gap. Allocate the escrow amount to the seller inside mapping
        // ...
        balanceOf[seller] += amount;

        emit Released();
    }

    /**
     * @notice Arbiter can return funds to the buyer if conditions are not met.
     */
    function refund() external onlyArbiter {
        if (currentState != State.AwaitingDelivery) revert InvalidState();

        currentState = State.Refunded;

        // 🛠️ TODO: Fill the gap. Allocate the escrow amount back to the buyer inside mapping
        // ...
        balanceOf[buyer] += amount;

        emit RefundedToBuyer();
    }

    /**
     * @notice Users pull their available funds using this function.
     * @dev Implements the secure Pull-over-Push pattern via low-level .call
     */
    function withdraw() external {
        // 1. Checks
        uint256 payment = balanceOf[msg.sender];
        if (payment == 0) revert NothingToWithdraw();

        // 2. Effects
        // 🛠️ TODO: Fill the gap. Clear user's balance before sending to prevent reentrancy (hint: C-E-I pattern!)
        // ...
        balanceOf[msg.sender] = 0;

        // 3. Interactions
        // 🛠️ TODO: Fill the gap. Send ETH using low-level .call and handle success/failure via custom error
        // ...
        (bool success, ) = msg.sender.call{value: payment}("");
        if (!success) revert TransferFailed();

        emit Withdrawn(msg.sender, payment);
    }
}