import { Contract, ethers } from "ethers";
import { env } from "../config/env";

const farmNftAbi = [
  "function mintForFarmer(address farmer,address to,string uri) returns (uint256)",
  "function burn(uint256 tokenId)",
  "function getFarmTokenInfo(uint256 tokenId) view returns (tuple(bool exists,string tokenUri,address originalFarmer,address currentOwner,bool farmerWhitelisted,uint256 mintedAt))",
  "event FarmNFTMinted(uint256 indexed tokenId,address indexed originalFarmer,address indexed owner,string tokenURI,uint256 mintedAt)"
];

const farmDaoAbi = [
  "function isWhitelistedFarmer(address farmer) view returns (bool)",
  "function isFarmerMintPaused(address farmer) view returns (bool)",
  "function canMint(address farmer) view returns (bool)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function nextProposalId() view returns (uint256)",
  "function quorum() view returns (uint256)",
  "function votingPeriod() view returns (uint256)",
  "function getProposal(uint256 proposalId) view returns (address account, uint8 action, string key, string value, bool flag, uint256 numberValue, uint256 tokenId, string evidenceURI, uint256 yesVotes, uint256 noVotes, uint256 deadline, bool executed)",
  "event VoteCast(uint256 indexed proposalId, address indexed voter, bool support)"
];

export type ChainTokenInfo = {
  exists: boolean;
  tokenUri: string;
  originalFarmer: string;
  currentOwner: string;
  farmerWhitelisted: boolean;
  mintedAt: string;
};

class BlockchainService {
  private provider = new ethers.JsonRpcProvider(env.RPC_URL);
  private signer = new ethers.Wallet(env.BACKEND_PRIVATE_KEY, this.provider);
  private farmNft = new Contract(env.FARM_NFT_ADDRESS, farmNftAbi, this.signer);
  private farmDao = new Contract(env.FARM_DAO_ADDRESS, farmDaoAbi, this.provider);

  async isWhitelistedFarmer(farmerAddress: string): Promise<boolean> {
    return this.farmDao.isWhitelistedFarmer(farmerAddress);
  }

  async isMember(address: string): Promise<boolean> {
    const MEMBER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MEMBER_ROLE"));
    return this.farmDao.hasRole(MEMBER_ROLE, address);
  }

  async getProposalCount(): Promise<number> {
    const count = await this.farmDao.nextProposalId();
    return Number(count);
  }

  async getProposal(proposalId: number) {
    const p = await this.farmDao.getProposal(proposalId);
    return {
      proposalId,
      account: p.account,
      action: Number(p.action),
      key: p.key,
      value: p.value,
      flag: p.flag,
      numberValue: p.numberValue.toString(),
      tokenId: p.tokenId.toString(),
      evidenceURI: p.evidenceURI,
      yesVotes: Number(p.yesVotes),
      noVotes: Number(p.noVotes),
      deadline: p.deadline.toString(),
      executed: p.executed,
      open: BigInt(Date.now()) / 1000n < p.deadline
    };
  }

  async hasVoted(proposalId: number, voter: string): Promise<boolean> {
    // hasVoted 在合約是 private，改查 VoteCast 事件
    const filter = this.farmDao.filters.VoteCast(proposalId, voter);
    const logs = await this.farmDao.queryFilter(filter);
    return logs.length > 0;
  }

  async mintForFarmer(params: { farmerAddress: string; ownerAddress: string; metadataUri: string }) {
    const tx = await this.farmNft.mintForFarmer(params.farmerAddress, params.ownerAddress, params.metadataUri);
    const receipt = await tx.wait();
    const event = receipt.logs
      .map((log: ethers.Log) => {
        try {
          return this.farmNft.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((log: ethers.LogDescription | null) => log?.name === "FarmNFTMinted");

    if (!event) {
      throw new Error("Mint transaction succeeded but FarmNFTMinted event was not found");
    }

    return {
      tokenId: event.args.tokenId.toString(),
      mintedAt: event.args.mintedAt.toString(),
      txHash: receipt.hash
    };
  }

  async burn(tokenId: string) {
    const tx = await this.farmNft.burn(tokenId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }

  async getTokenInfo(tokenId: string): Promise<ChainTokenInfo> {
    const info = await this.farmNft.getFarmTokenInfo(tokenId);
    return {
      exists: info.exists,
      tokenUri: info.tokenUri,
      originalFarmer: info.originalFarmer,
      currentOwner: info.currentOwner,
      farmerWhitelisted: info.farmerWhitelisted,
      mintedAt: info.mintedAt.toString()
    };
  }
}

export const blockchainService = new BlockchainService();
