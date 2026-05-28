// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SimpleVotingDAO {
    error VotingEnding();
    error AlreadyVoted();
    error InvalidProposal();

    struct Proposal {
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
    }

    // Dynamic array to hold proposals (Reading specific indexes in O(1))
    Proposal[] public proposals;

    // proposalId => (voterAddress => hasVoted)
    // Double mapping to ensure constant O(1) double-voting check
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed proposalId, string description, uint256 deadline);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);

    /**
     * @notice Creates a new proposal with a fixed voting duration.
     */
    function createProposal(string calldata _description, uint256 _durationInSeconds) external {
        uint256 deadline = block.timestamp + _durationInSeconds;

        proposals.push(Proposal({
            description: _description,
            votesFor: 0,
            votesAgainst: 0,
            deadline: deadline,
            executed: false
        }));

        emit ProposalCreated(proposals.length - 1, _description, deadline);
    }

    /**
     * @notice Casts a vote on a specific proposal.
     * @param _proposalId The index of the proposal in the array.
     * @param _support True for Yes, False for No.
     */
    function vote(uint256 _proposalId, bool _support) external {
        if (_proposalId >= proposals.length) revert InvalidProposal();
        
        // Storage pointer to modify data directly in blockchain state
        Proposal storage proposal = proposals[_proposalId];

        // 1. 🛠️ TODO: Check if the voting deadline has passed using block.timestamp. Revert with VotingEnded()
        if(block.timestamp > proposal.deadline) revert VotingEnding();

        // 2. 🛠️ TODO: Check if msg.sender has already voted on this proposal. Revert with AlreadyVoted()
        if(hasVoted[_proposalId][msg.sender]) revert AlreadyVoted();

        // 3. 🛠️ TODO: Record that msg.sender has voted now to prevent double-voting
        hasVoted[_proposalId][msg.sender] = true;

        // 4. 🛠️ TODO: Increment votesFor or votesAgainst based on the '_support' boolean flag (O(1) gas cost)
        if(_support) {
            proposal.votesFor += 1;
        } else {
            proposal.votesAgainst += 1;
        }

        emit Voted(_proposalId, msg.sender, _support, 1);
    }
}