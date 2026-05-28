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

  it("prevents double voting", async function () {
    const [admin, farmer] = await ethers.getSigners();
    const dao = await ethers.deployContract("FarmDAO", [admin.address, 60, 1]);

    await dao.proposeFarmer(farmer.address, "ipfs://evidence");
    await dao.vote(1, true);

    await expect(dao.vote(1, true)).to.be.revertedWithCustomError(dao, "AlreadyVoted");
  });
});
