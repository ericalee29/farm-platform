import { getAddress } from "ethers";

export function normalizeAddress(address: string) {
  return getAddress(address).toLowerCase();
}
