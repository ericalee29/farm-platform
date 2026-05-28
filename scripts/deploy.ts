import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const votingPeriod = 3 * 24 * 60 * 60;
  const quorumVotes = 1;

  const dao = await ethers.deployContract("FarmDAO", [deployer.address, votingPeriod, quorumVotes]);
  await dao.waitForDeployment();

  const nft = await ethers.deployContract("FarmNFT", [await dao.getAddress(), deployer.address]);
  await nft.waitForDeployment();
  await (await dao.setFarmNFT(await nft.getAddress())).wait();

  if (process.env.BACKEND_MINTER_ADDRESS) {
    await (await nft.grantRole(await nft.MINTER_ROLE(), process.env.BACKEND_MINTER_ADDRESS)).wait();
    await (await nft.grantRole(await nft.BURNER_ROLE(), process.env.BACKEND_MINTER_ADDRESS)).wait();
  }

  console.log("Deployer:", deployer.address);
  console.log("FarmDAO:", await dao.getAddress());
  console.log("FarmNFT:", await nft.getAddress());
  console.log("Backend minter:", process.env.BACKEND_MINTER_ADDRESS || "(not configured)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
