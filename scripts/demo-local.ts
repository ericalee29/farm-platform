import { ethers } from "hardhat";

async function main() {
  const [admin, farmer, consumer] = await ethers.getSigners();

  const dao = await ethers.deployContract("FarmDAO", [admin.address, 24 * 60 * 60, 1]);
  await dao.waitForDeployment();

  const nft = await ethers.deployContract("FarmNFT", [await dao.getAddress(), admin.address]);
  await nft.waitForDeployment();

  await (await dao.setFarmerWhitelist(farmer.address, true)).wait();

  const metadataUri = "ipfs://demo-farm-metadata-cid";
  const mintTx = await nft.mintForFarmer(farmer.address, consumer.address, metadataUri);
  await mintTx.wait();

  const tokenId = 1;
  const info = await nft.getFarmTokenInfo(tokenId);

  console.log("\n=== Farm NFT Local Demo ===");
  console.log("FarmDAO address:       ", await dao.getAddress());
  console.log("FarmNFT address:       ", await nft.getAddress());
  console.log("Token ID:              ", tokenId);
  console.log("Metadata URI:          ", info.tokenUri);
  console.log("Original farmer:       ", info.originalFarmer);
  console.log("Current owner:         ", info.currentOwner);
  console.log("DAO verified farmer:   ", info.farmerWhitelisted);
  console.log("Minted timestamp:      ", info.mintedAt.toString());
  console.log("===========================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
