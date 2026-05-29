// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// import standard ERC20 implementation from OpenZeppelin
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    error InsufficientETH();
    error HardcapReached();

    address public immutable owner;

    // 1ETH = 1000 MyTokens
    uint256 public constant RATE = 1000;

    // Maximum supply of MyTokens (e.g., 100,000 tokens with 18 decimals)
    uint256 public constant HARDCAP = 100000 * 10 ** 18; // 100,000 tokens with 18 decimals
    uint256 public totalRaised;

    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);

    // constructor to set token name and symbol, and assign ownership
    constructor() ERC20("MyEnterpriseToken", "MET") {
        owner = msg.sender;

        // Pre-mint - release 50.000 tokens to the owner for initial liquidity and operations
        _mint(owner, 50000 * 10 ** 18); // 50,000 tokens with 18 decimals
    }

    /**
     * @notice Allows users to buy MyTokens by sending ETH. The number of tokens minted is based on the fixed RATE.
     * @dev Checks for sufficient ETH, ensures the hardcap is not exceeded, updates totalRised, and mints tokens to the buyer. 
     */
    function buyTokens() external payable {
        if(msg.value == 0) revert InsufficientETH();

        uint256 tokensToMint = msg.value * RATE;

        // 1. 🛠️ TODO: Check if minting tokensToMint would exceed the HARDCAP. Revert with HardcapReached()
        if (totalRaised + tokensToMint > HARDCAP) {
            revert HardcapReached();
        }

        // 2. Increase totalRised by the amount of ETH received
        totalRaised += tokensToMint;

        // Call the internal _mint function from ERC20 to mint tokens to the buyer
        _mint(msg.sender, tokensToMint);

        emit TokensPurchased(msg.sender, msg.value, tokensToMint);
    }

    /**
     * @notice Allows the owner to withdraw the accumulated ETH from token sales.
     * @dev Only the owner can call this function. It transfers the entire balance of the contract to the owner.
     */
    function withdrawFunds() external {
        if (msg.sender != owner) {
            revert InsufficientETH();
        }
        
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}