import { expect } from "chai";
import { ethers } from "hardhat";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

describe("FarmNFT", function () {
  async function deployFixture() {
    const [admin, farmer, consumer, backend, outsider] = await ethers.getSigners();

    const dao = await ethers.deployContract("FarmDAO", [admin.address, 24 * 60 * 60, 1]);
    const nft = await ethers.deployContract("FarmNFT", [await dao.getAddress(), admin.address]);
    await nft.grantRole(await nft.MINTER_ROLE(), backend.address);

    return { admin, farmer, consumer, backend, outsider, dao, nft };
  }

  it("mints through backend only when farmer is whitelisted", async function () {
    const { farmer, consumer, backend, dao, nft } = await deployFixture();

    await expect(
      nft.connect(backend).mintForFarmer(farmer.address, consumer.address, "ipfs://metadata")
    ).to.be.revertedWithCustomError(nft, "FarmerNotWhitelisted");

    await dao.setFarmerWhitelist(farmer.address, true);

    await expect(nft.connect(backend).mintForFarmer(farmer.address, consumer.address, "ipfs://metadata"))
      .to.emit(nft, "FarmNFTMinted")
      .withArgs(1, farmer.address, consumer.address, "ipfs://metadata", anyValue);

    const info = await nft.getFarmTokenInfo(1);
    expect(info.exists).to.equal(true);
    expect(info.tokenUri).to.equal("ipfs://metadata");
    expect(info.originalFarmer).to.equal(farmer.address);
    expect(info.currentOwner).to.equal(consumer.address);
    expect(info.farmerWhitelisted).to.equal(true);
    expect(info.mintedAt).to.be.greaterThan(0);
  });

  it("lets a whitelisted farmer mint directly", async function () {
    const { farmer, dao, nft } = await deployFixture();

    await dao.setFarmerWhitelist(farmer.address, true);
    await nft.connect(farmer).mintByFarmer("ipfs://direct");

    expect(await nft.ownerOf(1)).to.equal(farmer.address);
    expect(await nft.originalFarmerOf(1)).to.equal(farmer.address);
  });

  it("returns a non-existing info payload instead of reverting", async function () {
    const { nft } = await deployFixture();

    const info = await nft.getFarmTokenInfo(404);
    expect(info.exists).to.equal(false);
    expect(info.originalFarmer).to.equal(ethers.ZeroAddress);
  });

  it("allows owner, original farmer, or admin to burn", async function () {
    const { farmer, consumer, backend, outsider, dao, nft } = await deployFixture();

    await dao.setFarmerWhitelist(farmer.address, true);
    await nft.connect(backend).mintForFarmer(farmer.address, consumer.address, "ipfs://metadata");

    await expect(nft.connect(outsider).burn(1)).to.be.revertedWithCustomError(nft, "NotTokenOwnerOrFarmer");
    await expect(nft.connect(farmer).burn(1)).to.emit(nft, "FarmNFTBurned").withArgs(1, farmer.address);

    const info = await nft.getFarmTokenInfo(1);
    expect(info.exists).to.equal(false);
  });
});
