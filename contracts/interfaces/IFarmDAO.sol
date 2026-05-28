// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IFarmDAO {
    function isWhitelistedFarmer(address farmer) external view returns (bool);
    function canMint(address farmer) external view returns (bool);
}
