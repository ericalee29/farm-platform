import { Wallet } from "ethers";
import "dotenv/config";

const privateKey = process.env.BACKEND_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY || "";

if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
  console.error("請先在 .env 填入有效的 BACKEND_PRIVATE_KEY 或 DEPLOYER_PRIVATE_KEY。");
  process.exitCode = 1;
} else {
  const wallet = new Wallet(privateKey);
  console.log("Wallet address:", wallet.address);
  console.log("把這個地址填到 .env 的 BACKEND_MINTER_ADDRESS。");
}
