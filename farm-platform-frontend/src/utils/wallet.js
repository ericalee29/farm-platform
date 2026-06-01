import { BrowserProvider } from 'ethers'

export async function connectWallet() {
  if (!window.ethereum) {
    alert('請安裝 MetaMask')
    return null
  }
  const provider = new BrowserProvider(window.ethereum)
  const accounts = await provider.send('eth_requestAccounts', [])
  return accounts[0] ?? null
}

export function shortenAddress(addr) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function getProvider() {
  if (!window.ethereum) return null
  return new BrowserProvider(window.ethereum)
}
