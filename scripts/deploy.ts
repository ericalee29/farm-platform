import { ethers } from "hardhat";

// ── 初始 DAO 成員（部署後立即加入，用逗號隔開可加多個地址）──────────
const INITIAL_DAO_MEMBERS: string[] = [
  // "0xYourTeamMember1Address",
  // "0xYourTeamMember2Address",
];

// ── 初始農民白名單（可以鑄造 NFT）──────────────────────────────────
const INITIAL_WHITELISTED_FARMERS: string[] = [
  // "0xFarmer1Address",
  // "0xFarmer2Address",
];

async function main() {
  const [deployer] = await ethers.getSigners();
  const votingPeriod = 3 * 24 * 60 * 60; // 3 天投票期
  const quorumVotes = 1;                  // 至少 1 票才能通過

  // ── Deploy ─────────────────────────────────────────────────────
  const dao = await ethers.deployContract("FarmDAO", [deployer.address, votingPeriod, quorumVotes]);
  await dao.waitForDeployment();

  const nft = await ethers.deployContract("FarmNFT", [await dao.getAddress(), deployer.address]);
  await nft.waitForDeployment();
  await (await dao.setFarmNFT(await nft.getAddress())).wait();

  // ── Backend minter role ────────────────────────────────────────
  if (process.env.BACKEND_MINTER_ADDRESS) {
    await (await nft.grantRole(await nft.MINTER_ROLE(), process.env.BACKEND_MINTER_ADDRESS)).wait();
    await (await nft.grantRole(await nft.BURNER_ROLE(), process.env.BACKEND_MINTER_ADDRESS)).wait();
  }

  // ── 加入初始 DAO 成員（只有 admin 能呼叫 addMember）──────────────
  for (const member of INITIAL_DAO_MEMBERS) {
    await (await dao.addMember(member)).wait();
    console.log("DAO member added:", member);
  }

  // ── 加入農民白名單（才能鑄造 NFT）──────────────────────────────
  for (const farmer of INITIAL_WHITELISTED_FARMERS) {
    await (await dao.setFarmerWhitelist(farmer, true)).wait();
    console.log("Farmer whitelisted:", farmer);
  }

  console.log("\n=== Deployment Summary ===");
  console.log("Deployer (initial admin + member):", deployer.address);
  console.log("FarmDAO:", await dao.getAddress());
  console.log("FarmNFT:", await nft.getAddress());
  console.log("Backend minter:", process.env.BACKEND_MINTER_ADDRESS || "(not configured)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
