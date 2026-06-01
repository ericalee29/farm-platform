import { Contract } from 'ethers'
import { getProvider } from './wallet'

// TODO: 填入合約地址（合約組確認後）
export const DAO_CONTRACT_ADDRESS = '0x384698AdB6126b6eabB705a9132dd80dbf8275D0'

export const DAO_ABI = [
  // Read
  'function isWhitelisted(address account) view returns (bool)',
  'function getProposals() view returns (tuple(uint256 proposalId, address applicantAddress, address proposerAddress, uint256 yesVotes, uint256 noVotes, uint256 deadline, bool executed, uint8 status, string description)[])',
  'function getProposal(uint256 proposalId) view returns (tuple(uint256 proposalId, address applicantAddress, address proposerAddress, uint256 yesVotes, uint256 noVotes, uint256 deadline, bool executed, uint8 status, string description))',
  'function hasVoted(uint256 proposalId, address voter) view returns (bool)',

  // Write — whitelist application (farmers apply themselves)
  'function propose(address applicantAddress, string description) returns (uint256)',
  // Write — dispute: burn a fraudulent NFT
  'function proposeBurnToken(uint256 tokenId, string evidenceURI) returns (uint256)',
  // Write — dispute: correct NFT metadata
  'function proposeMetadataCorrection(uint256 tokenId, string replacementMetadataURI, string evidenceURI) returns (uint256)',
  // Write — rule change: update quorum
  'function proposeQuorum(uint256 newQuorum, string evidenceURI) returns (uint256)',
  // Write — rule change: update voting period (seconds)
  'function proposeVotingPeriod(uint256 newVotingPeriod, string evidenceURI) returns (uint256)',
  'function vote(uint256 proposalId, bool support)',
  'function execute(uint256 proposalId)',

  // Events
  'event ProposalCreated(uint256 indexed proposalId, address indexed applicant)',
  'event Voted(uint256 indexed proposalId, address indexed voter, bool support)',
  'event ProposalExecuted(uint256 indexed proposalId)',
]

export function getDAOContract(signerOrProvider) {
  return new Contract(DAO_CONTRACT_ADDRESS, DAO_ABI, signerOrProvider)
}

export async function getReadContract() {
  const provider = getProvider()
  if (!provider) throw new Error('No provider')
  return getDAOContract(provider)
}

export async function getWriteContract() {
  const provider = getProvider()
  if (!provider) throw new Error('No provider')
  const signer = await provider.getSigner()
  return getDAOContract(signer)
}

export const STATUS_LABEL = {
  0: 'Pending',
  1: 'Active',
  2: 'Passed',
  3: 'Rejected',
  4: 'Executed',
}

export const STATUS_COLOR = {
  0: 'bg-gray-100 text-gray-500',
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-green-100 text-green-700',
  3: 'bg-red-100 text-red-500',
  4: 'bg-purple-100 text-purple-700',
}
