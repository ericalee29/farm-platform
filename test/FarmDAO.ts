import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("FarmDAO", function () {
  it("approves a farmer through proposal, vote, and execute", async function () {
    const [admin, member, farmer] = await ethers.getSigners();
    const dao = await ethers.deployContract("FarmDAO", [admin.address, 60, 2]);

    await dao.addMember(member.address);
    await dao.proposeFarmer(farmer.address, "ipfs://evidence");
    await dao.vote(1, true);
    await dao.connect(member).vote(1, true);

    await time.increase(61);
    await expect(dao.execute(1)).to.emit(dao, "ProposalExecuted").withArgs(1, farmer.address, 0, true);

    expect(await dao.isWhitelistedFarmer(farmer.address)).to.equal(true);
  });

  it("removes a whitelisted farmer through proposal, vote, and execute", async function () {
    const [admin, member, farmer] = await ethers.getSigners();
    const dao = await ethers.deployContract("FarmDAO", [admin.address, 60, 2]);

    await dao.setFarmerWhitelist(farmer.address, true);
    await dao.addMember(member.address);
    await dao.proposeFarmerRemoval(farmer.address, "ipfs://removal-evidence");
    await dao.vote(1, true);
    await dao.connect(member).vote(1, true);

    await time.increase(61);
    await expect(dao.execute(1)).to.emit(dao, "ProposalExecuted").withArgs(1, farmer.address, 1, true);

    expect(await dao.isWhitelistedFarmer(farmer.address)).to.equal(false);
  });

  it("pauses and unpauses a farmer mint permission through governance", async function () {
    const [admin, member, farmer] = await ethers.getSigners();
    const dao = await ethers.deployContract("FarmDAO", [admin.address, 60, 2]);

    await dao.setFarmerWhitelist(farmer.address, true);
    await dao.addMember(member.address);
    await dao.proposeFarmerMintPause(farmer.address, true, "ipfs://pause-evidence");
    await dao.vote(1, true);
    await dao.connect(member).vote(1, true);

    await time.increase(61);
    await dao.execute(1);

    expect(await dao.isFarmerMintPaused(farmer.address)).to.equal(true);
    expect(await dao.canMint(farmer.address)).to.equal(false);

    await dao.proposeFarmerMintPause(farmer.address, false, "ipfs://unpause-evidence");
    await dao.vote(2, true);
    await dao.connect(member).vote(2, true);

    await time.increase(61);
    await dao.execute(2);

    expect(await dao.isFarmerMintPaused(farmer.address)).to.equal(false);
    expect(await dao.canMint(farmer.address)).to.equal(true);
  });

  it("updates certification rules and governance parameters through proposals", async function () {
    const [admin, member] = await ethers.getSigners();
    const dao = await ethers.deployContract("FarmDAO", [admin.address, 60, 2]);

    await dao.addMember(member.address);

    await dao.proposeOrganicCertificationURI("ipfs://organic-standard-v2", "ipfs://standard-evidence");
    await dao.vote(1, true);
    await dao.connect(member).vote(1, true);
    await time.increase(61);
    await dao.execute(1);
    expect(await dao.organicCertificationURI()).to.equal("ipfs://organic-standard-v2");

    await dao.proposeProductCategory("aquaculture", true, "ipfs://category-evidence");
    await dao.vote(2, true);
    await dao.connect(member).vote(2, true);
    await time.increase(61);
    await dao.execute(2);
    expect(await dao.isProductCategoryEnabled("aquaculture")).to.equal(true);

    await dao.proposeRequiredMetadataField("carbonFootprint", true, "ipfs://field-evidence");
    await dao.vote(3, true);
    await dao.connect(member).vote(3, true);
    await time.increase(61);
    await dao.execute(3);
    expect(await dao.isMetadataFieldRequired("carbonFootprint")).to.equal(true);

    await dao.proposeCarbonFootprintRequired(true, "ipfs://carbon-evidence");
    await dao.vote(4, true);
    await dao.connect(member).vote(4, true);
    await time.increase(61);
    await dao.execute(4);
    expect(await dao.carbonFootprintRequired()).to.equal(true);

    await dao.proposeQuorum(1, "ipfs://quorum-evidence");
    await dao.vote(5, true);
    await dao.connect(member).vote(5, true);
    await time.increase(61);
    await dao.execute(5);
    expect(await dao.quorum()).to.equal(1);

    await dao.proposeVotingPeriod(120, "ipfs://period-evidence");
    await dao.vote(6, true);
    await time.increase(61);
    await dao.execute(6);
    expect(await dao.votingPeriod()).to.equal(120);
  });

  it("adds and removes DAO members through governance", async function () {
    const [admin, member, newMember] = await ethers.getSigners();
    const dao = await ethers.deployContract("FarmDAO", [admin.address, 60, 2]);
    const memberRole = await dao.MEMBER_ROLE();

    await dao.addMember(member.address);
    await dao.proposeMember(newMember.address, true, "ipfs://member-evidence");
    await dao.vote(1, true);
    await dao.connect(member).vote(1, true);
    await time.increase(61);
    await dao.execute(1);
    expect(await dao.hasRole(memberRole, newMember.address)).to.equal(true);

    await dao.proposeMember(newMember.address, false, "ipfs://remove-member-evidence");
    await dao.vote(2, true);
    await dao.connect(member).vote(2, true);
    await time.increase(61);
    await dao.execute(2);
    expect(await dao.hasRole(memberRole, newMember.address)).to.equal(false);
  });

  it("burns a disputed NFT through DAO vote", async function () {
    const [admin, member, farmer, consumer] = await ethers.getSigners();
    const dao = await ethers.deployContract("FarmDAO", [admin.address, 60, 2]);
    const nft = await ethers.deployContract("FarmNFT", [await dao.getAddress(), admin.address]);

    await dao.setFarmNFT(await nft.getAddress());
    await dao.setFarmerWhitelist(farmer.address, true);
    await nft.mintForFarmer(farmer.address, consumer.address, "ipfs://metadata");
    await dao.addMember(member.address);

    await dao.proposeBurnToken(1, "ipfs://fraud-report");
    await dao.vote(1, true);
    await dao.connect(member).vote(1, true);

    await time.increase(61);
    await expect(dao.execute(1)).to.emit(nft, "FarmNFTBurned").withArgs(1, await dao.getAddress());

    const info = await nft.getFarmTokenInfo(1);
    expect(info.exists).to.equal(false);
  });

  it("approves metadata correction through DAO vote", async function () {
    const [admin, member] = await ethers.getSigners();
    const dao = await ethers.deployContract("FarmDAO", [admin.address, 60, 2]);

    await dao.addMember(member.address);
    await dao.proposeMetadataCorrection(1, "ipfs://replacement-metadata", "ipfs://correction-evidence");
    await dao.vote(1, true);
    await dao.connect(member).vote(1, true);

    await time.increase(61);
    await expect(dao.execute(1))
      .to.emit(dao, "MetadataCorrectionApproved")
      .withArgs(1, "ipfs://replacement-metadata");

    expect(await dao.isMetadataCorrectionApproved(1)).to.equal(true);
  });

  it("prevents double voting", async function () {
    const [admin, farmer] = await ethers.getSigners();
    const dao = await ethers.deployContract("FarmDAO", [admin.address, 60, 1]);

    await dao.proposeFarmer(farmer.address, "ipfs://evidence");
    await dao.vote(1, true);

    await expect(dao.vote(1, true)).to.be.revertedWithCustomError(dao, "AlreadyVoted");
  });
});
