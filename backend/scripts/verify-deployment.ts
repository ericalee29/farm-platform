import { ethers } from "hardhat";

const FARM_DAO_ADDRESS = "0x384698AdB6126b6eabB705a9132dd80dbf8275D0";
const FARM_NFT_ADDRESS = "0x4E10ce681F5e804e8cdcAd850918f4e40301E91d";

const farmDaoAbi = [
  "function quorum() view returns (uint256)",
  "function votingPeriod() view returns (uint256)",
  "function nextProposalId() view returns (uint256)",
  "function isWhitelistedFarmer(address) view returns (bool)"
];

const farmNftAbi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function farmDAO() view returns (address)"
];

async function main() {
  const [signer] = await ethers.getSigners();

  const dao = new ethers.Contract(FARM_DAO_ADDRESS, farmDaoAbi, signer);
  const nft = new ethers.Contract(FARM_NFT_ADDRESS, farmNftAbi, signer);

  console.log("=== FarmDAO ===");
  console.log("quorum:        ", (await dao.quorum()).toString());
  console.log("votingPeriod:  ", (await dao.votingPeriod()).toString(), "秒");
  console.log("nextProposalId:", (await dao.nextProposalId()).toString());

  console.log("\n=== FarmNFT ===");
  console.log("name:   ", await nft.name());
  console.log("symbol: ", await nft.symbol());

  const linkedDao = await nft.farmDAO();
  const daoMatch = linkedDao.toLowerCase() === FARM_DAO_ADDRESS.toLowerCase();
  console.log("farmDAO:", linkedDao, daoMatch ? "✅ 地址吻合" : "❌ 地址不符");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});