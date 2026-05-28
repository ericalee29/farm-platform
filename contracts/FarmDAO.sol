// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract FarmDAO is AccessControl {
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");

    enum ProposalAction {
        Add,
        Remove
    }

    struct Proposal {
        address farmer;
        ProposalAction action;
        string evidenceURI;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 deadline;
        bool executed;
        mapping(address voter => bool voted) hasVoted;
    }

    uint256 public immutable votingPeriod;
    uint256 public immutable quorum;
    uint256 public nextProposalId;

    mapping(address farmer => bool whitelisted) public isWhitelistedFarmer;
    mapping(uint256 proposalId => Proposal proposal) private _proposals;

    event MemberAdded(address indexed member);
    event MemberRemoved(address indexed member);
    event FarmerProposed(
        uint256 indexed proposalId,
        address indexed farmer,
        ProposalAction action,
        string evidenceURI,
        uint256 deadline
    );
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId, address indexed farmer, ProposalAction action, bool approved);
    event FarmerWhitelistSet(address indexed farmer, bool whitelisted);

    error InvalidAddress();
    error ProposalNotFound(uint256 proposalId);
    error VotingClosed(uint256 proposalId);
    error VotingStillOpen(uint256 proposalId);
    error AlreadyVoted(uint256 proposalId, address voter);
    error AlreadyExecuted(uint256 proposalId);

    constructor(address admin, uint256 votingPeriodSeconds, uint256 quorumVotes) {
        if (admin == address(0)) {
            revert InvalidAddress();
        }

        votingPeriod = votingPeriodSeconds;
        quorum = quorumVotes;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MEMBER_ROLE, admin);
    }

    function addMember(address member) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (member == address(0)) {
            revert InvalidAddress();
        }
        _grantRole(MEMBER_ROLE, member);
        emit MemberAdded(member);
    }

    function removeMember(address member) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(MEMBER_ROLE, member);
        emit MemberRemoved(member);
    }

    function setFarmerWhitelist(address farmer, bool whitelisted) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (farmer == address(0)) {
            revert InvalidAddress();
        }
        isWhitelistedFarmer[farmer] = whitelisted;
        emit FarmerWhitelistSet(farmer, whitelisted);
    }

    function proposeFarmer(address farmer, string calldata evidenceURI)
        external
        onlyRole(MEMBER_ROLE)
        returns (uint256 proposalId)
    {
        return _createProposal(farmer, ProposalAction.Add, evidenceURI);
    }

    function proposeFarmerRemoval(address farmer, string calldata evidenceURI)
        external
        onlyRole(MEMBER_ROLE)
        returns (uint256 proposalId)
    {
        return _createProposal(farmer, ProposalAction.Remove, evidenceURI);
    }

    function vote(uint256 proposalId, bool support) external onlyRole(MEMBER_ROLE) {
        Proposal storage proposal = _requireProposal(proposalId);
        if (block.timestamp > proposal.deadline) {
            revert VotingClosed(proposalId);
        }
        if (proposal.hasVoted[msg.sender]) {
            revert AlreadyVoted(proposalId, msg.sender);
        }

        proposal.hasVoted[msg.sender] = true;
        if (support) {
            proposal.yesVotes += 1;
        } else {
            proposal.noVotes += 1;
        }

        emit VoteCast(proposalId, msg.sender, support);
    }

    function execute(uint256 proposalId) external {
        Proposal storage proposal = _requireProposal(proposalId);
        if (block.timestamp <= proposal.deadline) {
            revert VotingStillOpen(proposalId);
        }
        if (proposal.executed) {
            revert AlreadyExecuted(proposalId);
        }

        proposal.executed = true;
        bool approved = proposal.yesVotes >= quorum && proposal.yesVotes > proposal.noVotes;
        if (approved) {
            bool whitelisted = proposal.action == ProposalAction.Add;
            isWhitelistedFarmer[proposal.farmer] = whitelisted;
            emit FarmerWhitelistSet(proposal.farmer, whitelisted);
        }

        emit ProposalExecuted(proposalId, proposal.farmer, proposal.action, approved);
    }

    function getProposal(uint256 proposalId)
        external
        view
        returns (
            address farmer,
            ProposalAction action,
            string memory evidenceURI,
            uint256 yesVotes,
            uint256 noVotes,
            uint256 deadline,
            bool executed
        )
    {
        Proposal storage proposal = _requireProposal(proposalId);
        return (
            proposal.farmer,
            proposal.action,
            proposal.evidenceURI,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.deadline,
            proposal.executed
        );
    }

    function _createProposal(address farmer, ProposalAction action, string calldata evidenceURI)
        private
        returns (uint256 proposalId)
    {
        if (farmer == address(0)) {
            revert InvalidAddress();
        }

        proposalId = ++nextProposalId;
        Proposal storage proposal = _proposals[proposalId];
        proposal.farmer = farmer;
        proposal.action = action;
        proposal.evidenceURI = evidenceURI;
        proposal.deadline = block.timestamp + votingPeriod;

        emit FarmerProposed(proposalId, farmer, action, evidenceURI, proposal.deadline);
    }

    function _requireProposal(uint256 proposalId) private view returns (Proposal storage proposal) {
        proposal = _proposals[proposalId];
        if (proposal.farmer == address(0)) {
            revert ProposalNotFound(proposalId);
        }
    }
}
