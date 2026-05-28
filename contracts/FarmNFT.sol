// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IFarmDAO} from "./interfaces/IFarmDAO.sol";

contract FarmNFT is ERC721, ERC721URIStorage, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    struct FarmTokenInfo {
        bool exists;
        string tokenUri;
        address originalFarmer;
        address currentOwner;
        bool farmerWhitelisted;
        uint256 mintedAt;
    }

    IFarmDAO public farmDAO;
    uint256 private _nextTokenId;

    mapping(uint256 tokenId => address farmer) private _originalFarmers;
    mapping(uint256 tokenId => uint256 timestamp) private _mintedAt;

    event FarmDAOUpdated(address indexed oldFarmDAO, address indexed newFarmDAO);
    event FarmNFTMinted(
        uint256 indexed tokenId,
        address indexed originalFarmer,
        address indexed owner,
        string tokenURI,
        uint256 mintedAt
    );
    event FarmNFTBurned(uint256 indexed tokenId, address indexed burnedBy);

    error InvalidAddress();
    error FarmerNotWhitelisted(address farmer);
    error TokenDoesNotExist(uint256 tokenId);
    error NotTokenOwnerOrFarmer(uint256 tokenId, address caller);

    constructor(address farmDAOAddress, address admin) ERC721("Farm Traceability NFT", "FARM") {
        if (farmDAOAddress == address(0) || admin == address(0)) {
            revert InvalidAddress();
        }

        farmDAO = IFarmDAO(farmDAOAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(BURNER_ROLE, admin);
        _grantRole(BURNER_ROLE, farmDAOAddress);
    }

    function setFarmDAO(address newFarmDAO) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newFarmDAO == address(0)) {
            revert InvalidAddress();
        }

        address oldFarmDAO = address(farmDAO);
        farmDAO = IFarmDAO(newFarmDAO);
        emit FarmDAOUpdated(oldFarmDAO, newFarmDAO);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function mintByFarmer(string calldata uri) external whenNotPaused nonReentrant returns (uint256 tokenId) {
        return _mintFarmNFT(msg.sender, msg.sender, uri);
    }

    function mintForFarmer(
        address farmer,
        address to,
        string calldata uri
    ) external onlyRole(MINTER_ROLE) whenNotPaused nonReentrant returns (uint256 tokenId) {
        return _mintFarmNFT(farmer, to, uri);
    }

    function burn(uint256 tokenId) external whenNotPaused {
        _requireTokenExists(tokenId);

        address owner = ownerOf(tokenId);
        address originalFarmer = _originalFarmers[tokenId];
        if (
            msg.sender != owner
                && msg.sender != originalFarmer
                && !hasRole(BURNER_ROLE, msg.sender)
                && !hasRole(DEFAULT_ADMIN_ROLE, msg.sender)
        ) {
            revert NotTokenOwnerOrFarmer(tokenId, msg.sender);
        }

        _burn(tokenId);
        delete _originalFarmers[tokenId];
        delete _mintedAt[tokenId];

        emit FarmNFTBurned(tokenId, msg.sender);
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    function originalFarmerOf(uint256 tokenId) external view returns (address) {
        _requireTokenExists(tokenId);
        return _originalFarmers[tokenId];
    }

    function mintedAtOf(uint256 tokenId) external view returns (uint256) {
        _requireTokenExists(tokenId);
        return _mintedAt[tokenId];
    }

    function getFarmTokenInfo(uint256 tokenId) external view returns (FarmTokenInfo memory info) {
        if (!exists(tokenId)) {
            return FarmTokenInfo(false, "", address(0), address(0), false, 0);
        }

        address farmer = _originalFarmers[tokenId];
        return FarmTokenInfo({
            exists: true,
            tokenUri: tokenURI(tokenId),
            originalFarmer: farmer,
            currentOwner: ownerOf(tokenId),
            farmerWhitelisted: farmDAO.isWhitelistedFarmer(farmer),
            mintedAt: _mintedAt[tokenId]
        });
    }

    function _mintFarmNFT(
        address farmer,
        address to,
        string calldata uri
    ) private returns (uint256 tokenId) {
        if (farmer == address(0) || to == address(0)) {
            revert InvalidAddress();
        }
        if (!farmDAO.canMint(farmer)) {
            revert FarmerNotWhitelisted(farmer);
        }

        tokenId = ++_nextTokenId;
        uint256 timestamp = block.timestamp;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _originalFarmers[tokenId] = farmer;
        _mintedAt[tokenId] = timestamp;

        emit FarmNFTMinted(tokenId, farmer, to, uri, timestamp);
    }

    function _requireTokenExists(uint256 tokenId) private view {
        if (!exists(tokenId)) {
            revert TokenDoesNotExist(tokenId);
        }
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
