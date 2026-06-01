// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

interface IFarmNFTBurnable {
    function burn(uint256 tokenId) external;
}

contract FarmDAO is AccessControl {
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");

    enum ProposalAction {
        AddFarmer,
        RemoveFarmer,
        PauseFarmerMint,
        UnpauseFarmerMint,
        SetOrganicCertificationURI,
        SetProductCategory,
        SetRequiredMetadataField,
        SetCarbonFootprintRequired,
        SetQuorum,
        SetVotingPeriod,
        AddMember,
        RemoveMember,
        BurnToken,
        ApproveMetadataCorrection
    }

    struct Proposal {
        bool exists;
        address account;
        ProposalAction action;
        string key;
        string value;
        bool flag;
        uint256 numberValue;
        uint256 tokenId;
        string evidenceURI;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 deadline;
        bool executed;
        mapping(address voter => bool voted) hasVoted;
    }

    uint256 public votingPeriod;
    uint256 public quorum;
    uint256 public nextProposalId;
    address public farmNFT;
    string public organicCertificationURI;
    bool public carbonFootprintRequired;

    mapping(address farmer => bool whitelisted) public isWhitelistedFarmer;
    mapping(address farmer => bool paused) public isFarmerMintPaused;
    mapping(string category => bool enabled) public isProductCategoryEnabled;
    mapping(string fieldName => bool required) public isMetadataFieldRequired;
    mapping(uint256 tokenId => bool approved) public isMetadataCorrectionApproved;
    mapping(uint256 proposalId => Proposal proposal) private _proposals;

    event MemberAdded(address indexed member);
    event MemberRemoved(address indexed member);
    event FarmNFTSet(address indexed farmNFT);
    event FarmerWhitelistSet(address indexed farmer, bool whitelisted);
    event FarmerMintPausedSet(address indexed farmer, bool paused);
    event OrganicCertificationURISet(string uri);
    event ProductCategorySet(string indexed categoryHash, string category, bool enabled);
    event RequiredMetadataFieldSet(string indexed fieldHash, string fieldName, bool required);
    event CarbonFootprintRequiredSet(bool required);
    event GovernanceParamsSet(uint256 quorum, uint256 votingPeriod);
    event TokenBurnApproved(uint256 indexed tokenId);
    event MetadataCorrectionApproved(uint256 indexed tokenId, string replacementMetadataURI);
    event ProposalCreated(
        uint256 indexed proposalId,
        ProposalAction action,
        address indexed account,
        uint256 indexed tokenId,
        string key,
        string value,
        bool flag,
        uint256 numberValue,
        string evidenceURI,
        uint256 deadline
    );
    event FarmerProposed(
        uint256 indexed proposalId,
        address indexed farmer,
        ProposalAction action,
        string evidenceURI,
        uint256 deadline
    );
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId, address indexed account, ProposalAction action, bool approved);

    error InvalidAddress();
    error InvalidValue();
    error FarmNFTNotSet();
    error ProposalNotFound(uint256 proposalId);
    error VotingClosed(uint256 proposalId);
    error VotingStillOpen(uint256 proposalId);
    error AlreadyVoted(uint256 proposalId, address voter);
    error AlreadyExecuted(uint256 proposalId);

    constructor(address admin, uint256 votingPeriodSeconds, uint256 quorumVotes) {
        if (admin == address(0)) {
            revert InvalidAddress();
        }
        if (votingPeriodSeconds == 0 || quorumVotes == 0) {
            revert InvalidValue();
        }

        votingPeriod = votingPeriodSeconds;
        quorum = quorumVotes;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MEMBER_ROLE, admin);
    }

    function setFarmNFT(address farmNFTAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (farmNFTAddress == address(0)) {
            revert InvalidAddress();
        }
        farmNFT = farmNFTAddress;
        emit FarmNFTSet(farmNFTAddress);
    }

    function addMember(address member) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _addMember(member);
    }

    function removeMember(address member) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _removeMember(member);
    }

    function setFarmerWhitelist(address farmer, bool whitelisted) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setFarmerWhitelist(farmer, whitelisted);
    }

    function canMint(address farmer) external view returns (bool) {
        return isWhitelistedFarmer[farmer] && !isFarmerMintPaused[farmer];
    }

    function proposeFarmer(address farmer, string calldata evidenceURI)
        external
        onlyRole(MEMBER_ROLE)
        returns (uint256 proposalId)
    {
        return _createAccountProposal(farmer, ProposalAction.AddFarmer, evidenceURI);
    }

    function proposeFarmerRemoval(address farmer, string calldata evidenceURI)
        external
        onlyRole(MEMBER_ROLE)
        returns (uint256 proposalId)
    {
        return _createAccountProposal(farmer, ProposalAction.RemoveFarmer, evidenceURI);
    }

    function proposeFarmerMintPause(address farmer, bool paused, string calldata evidenceURI)
        external
        onlyRole(MEMBER_ROLE)
        returns (uint256 proposalId)
    {
        return _createAccountProposal(
            farmer,
            paused ? ProposalAction.PauseFarmerMint : ProposalAction.UnpauseFarmerMint,
            evidenceURI
        );
    }

    function proposeOrganicCertificationURI(string calldata uri, string calldata evidenceURI)
        external
        onlyRole(MEMBER_ROLE)
        returns (uint256 proposalId)
    {
        if (bytes(uri).length == 0) {
            revert InvalidValue();
        }
        return _createProposal(ProposalAction.SetOrganicCertificationURI, address(0), 0, "", uri, false, 0, evidenceURI);
    }

    function proposeProductCategory(string calldata category, bool enabled, string calldata evidenceURI)
        external
        onlyRole(MEMBER_ROLE)
        returns (uint256 proposalId)
    {
        if (bytes(category).length == 0) {
            revert InvalidValue();
        }
        return _createProposal(ProposalAction.SetProductCategory, address(0), 0, category, "", enabled, 0, evidenceURI);
    }

    function proposeRequiredMetadataField(string calldata fieldName, bool required, string calldata evidenceURI)
        external
        onlyRole(MEMBER_ROLE)
        returns (uint256 proposalId)
    {
        if (bytes(fieldName).length == 0) {
            revert InvalidValue();
        }
        return _createProposal(ProposalAction.SetRequiredMetadataField, address(0), 0, fieldName, "", required, 0, evidenceURI);
    }

    function proposeCarbonFootprintRequired(bool required, string calldata evidenceURI)
        external
        onlyRole(MEMBER_ROLE)
        returns (uint256 proposalId)
    {
        return _createProposal(ProposalAction.SetCarbonFootprintRequired, address(0), 0, "", "", required, 0, evidenceURI);
    }

    function proposeQuorum(uint256 newQuorum, string calldata evidenceURI)
        external
        onlyRole(MEMBER_ROLE)
        returns (uint256 proposalId)
    {
        if (newQuorum == 0) {
            revert InvalidValue();
        }
        return _createProposal(ProposalAction.SetQuorum, address(0), 0, "", "", false, newQuorum, evidenceURI);
    }

    function proposeVotingPeriod(uint256 newVotingPeriod, string calldata evidenceURI)
        external
        onlyRole(MEMBER_ROLE)
        returns (uint256 proposalId)
    {
        if (newVotingPeriod == 0) {
            revert InvalidValue();
        }
        return _createProposal(ProposalAction.SetVotingPeriod, address(0), 0, "", "", false, newVotingPeriod, evidenceURI);
    }

    function proposeMember(address member, bool add, string calldata evidenceURI)
        external
        onlyRole(MEMBER_ROLE)
        returns (uint256 proposalId)
    {
        return _createAccountProposal(member, add ? ProposalAction.AddMember : ProposalAction.RemoveMember, evidenceURI);
    }

    function proposeBurnToken(uint256 tokenId, string calldata evidenceURI)
        external
        onlyRole(MEMBER_ROLE)
        returns (uint256 proposalId)
    {
        if (tokenId == 0) {
            revert InvalidValue();
        }
        return _createProposal(ProposalAction.BurnToken, address(0), tokenId, "", "", false, 0, evidenceURI);
    }

    function proposeMetadataCorrection(
        uint256 tokenId,
        string calldata replacementMetadataURI,
        string calldata evidenceURI
    ) external onlyRole(MEMBER_ROLE) returns (uint256 proposalId) {
        if (tokenId == 0 || bytes(replacementMetadataURI).length == 0) {
            revert InvalidValue();
        }
        return _createProposal(
            ProposalAction.ApproveMetadataCorrection,
            address(0),
            tokenId,
            "",
            replacementMetadataURI,
            false,
            0,
            evidenceURI
        );
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
            _executeApprovedProposal(proposal);
        }

        emit ProposalExecuted(proposalId, proposal.account, proposal.action, approved);
    }

    function getProposal(uint256 proposalId)
        external
        view
        returns (
            address account,
            ProposalAction action,
            string memory key,
            string memory value,
            bool flag,
            uint256 numberValue,
            uint256 tokenId,
            string memory evidenceURI,
            uint256 yesVotes,
            uint256 noVotes,
            uint256 deadline,
            bool executed
        )
    {
        Proposal storage proposal = _requireProposal(proposalId);
        return (
            proposal.account,
            proposal.action,
            proposal.key,
            proposal.value,
            proposal.flag,
            proposal.numberValue,
            proposal.tokenId,
            proposal.evidenceURI,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.deadline,
            proposal.executed
        );
    }

    function _executeApprovedProposal(Proposal storage proposal) private {
        if (proposal.action == ProposalAction.AddFarmer) {
            _setFarmerWhitelist(proposal.account, true);
        } else if (proposal.action == ProposalAction.RemoveFarmer) {
            _setFarmerWhitelist(proposal.account, false);
        } else if (proposal.action == ProposalAction.PauseFarmerMint) {
            _setFarmerMintPaused(proposal.account, true);
        } else if (proposal.action == ProposalAction.UnpauseFarmerMint) {
            _setFarmerMintPaused(proposal.account, false);
        } else if (proposal.action == ProposalAction.SetOrganicCertificationURI) {
            organicCertificationURI = proposal.value;
            emit OrganicCertificationURISet(proposal.value);
        } else if (proposal.action == ProposalAction.SetProductCategory) {
            isProductCategoryEnabled[proposal.key] = proposal.flag;
            emit ProductCategorySet(proposal.key, proposal.key, proposal.flag);
        } else if (proposal.action == ProposalAction.SetRequiredMetadataField) {
            isMetadataFieldRequired[proposal.key] = proposal.flag;
            emit RequiredMetadataFieldSet(proposal.key, proposal.key, proposal.flag);
        } else if (proposal.action == ProposalAction.SetCarbonFootprintRequired) {
            carbonFootprintRequired = proposal.flag;
            emit CarbonFootprintRequiredSet(proposal.flag);
        } else if (proposal.action == ProposalAction.SetQuorum) {
            quorum = proposal.numberValue;
            emit GovernanceParamsSet(quorum, votingPeriod);
        } else if (proposal.action == ProposalAction.SetVotingPeriod) {
            votingPeriod = proposal.numberValue;
            emit GovernanceParamsSet(quorum, votingPeriod);
        } else if (proposal.action == ProposalAction.AddMember) {
            _addMember(proposal.account);
        } else if (proposal.action == ProposalAction.RemoveMember) {
            _removeMember(proposal.account);
        } else if (proposal.action == ProposalAction.BurnToken) {
            _burnToken(proposal.tokenId);
        } else if (proposal.action == ProposalAction.ApproveMetadataCorrection) {
            isMetadataCorrectionApproved[proposal.tokenId] = true;
            emit MetadataCorrectionApproved(proposal.tokenId, proposal.value);
        }
    }

    function _createAccountProposal(address account, ProposalAction action, string calldata evidenceURI)
        private
        returns (uint256 proposalId)
    {
        if (account == address(0)) {
            revert InvalidAddress();
        }
        return _createProposal(action, account, 0, "", "", false, 0, evidenceURI);
    }

    function _createProposal(
        ProposalAction action,
        address account,
        uint256 tokenId,
        string memory key,
        string memory value,
        bool flag,
        uint256 numberValue,
        string calldata evidenceURI
    ) private returns (uint256 proposalId) {
        proposalId = ++nextProposalId;
        Proposal storage proposal = _proposals[proposalId];
        proposal.exists = true;
        proposal.account = account;
        proposal.action = action;
        proposal.key = key;
        proposal.value = value;
        proposal.flag = flag;
        proposal.numberValue = numberValue;
        proposal.tokenId = tokenId;
        proposal.evidenceURI = evidenceURI;
        proposal.deadline = block.timestamp + votingPeriod;

        emit ProposalCreated(
            proposalId,
            action,
            account,
            tokenId,
            key,
            value,
            flag,
            numberValue,
            evidenceURI,
            proposal.deadline
        );

        if (
            action == ProposalAction.AddFarmer || action == ProposalAction.RemoveFarmer
                || action == ProposalAction.PauseFarmerMint || action == ProposalAction.UnpauseFarmerMint
        ) {
            emit FarmerProposed(proposalId, account, action, evidenceURI, proposal.deadline);
        }
    }

    function _addMember(address member) private {
        if (member == address(0)) {
            revert InvalidAddress();
        }
        _grantRole(MEMBER_ROLE, member);
        emit MemberAdded(member);
    }

    function _removeMember(address member) private {
        _revokeRole(MEMBER_ROLE, member);
        emit MemberRemoved(member);
    }

    function _setFarmerWhitelist(address farmer, bool whitelisted) private {
        if (farmer == address(0)) {
            revert InvalidAddress();
        }
        isWhitelistedFarmer[farmer] = whitelisted;
        emit FarmerWhitelistSet(farmer, whitelisted);
    }

    function _setFarmerMintPaused(address farmer, bool paused) private {
        if (farmer == address(0)) {
            revert InvalidAddress();
        }
        isFarmerMintPaused[farmer] = paused;
        emit FarmerMintPausedSet(farmer, paused);
    }

    function _burnToken(uint256 tokenId) private {
        if (farmNFT == address(0)) {
            revert FarmNFTNotSet();
        }
        IFarmNFTBurnable(farmNFT).burn(tokenId);
        emit TokenBurnApproved(tokenId);
    }

    function _requireProposal(uint256 proposalId) private view returns (Proposal storage proposal) {
        proposal = _proposals[proposalId];
        if (!proposal.exists) {
            revert ProposalNotFound(proposalId);
        }
    }
}
