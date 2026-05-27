const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { getAddress } = require("ethers");

const env = process.env;

function isPlaceholder(value) {
  if (!value) return true;
  return /YOUR_|your-|0xYour|change-me/i.test(value);
}

function checkUrl(name) {
  const value = env[name];
  try {
    if (isPlaceholder(value)) throw new Error("placeholder");
    new URL(value || "");
    return { name, ok: true, message: "已設定" };
  } catch {
    return { name, ok: false, message: "請填入有效 URL" };
  }
}

function checkPrivateKey(name) {
  const value = env[name];
  const ok = /^0x[0-9a-fA-F]{64}$/.test(value || "");
  return { name, ok, message: ok ? "格式正確" : "請填入 0x 開頭、64 個十六進位字元的測試錢包私鑰" };
}

function checkAddress(name) {
  try {
    if (isPlaceholder(env[name])) throw new Error("placeholder");
    getAddress(env[name] || "");
    return { name, ok: true, message: "格式正確" };
  } catch {
    return { name, ok: false, message: "請填入有效 0x 錢包或合約地址" };
  }
}

function checkText(name, minLength = 1) {
  const value = env[name] || "";
  const ok = !isPlaceholder(value) && value.length >= minLength;
  return { name, ok, message: ok ? "已設定" : `請填入至少 ${minLength} 字元` };
}

const checks = [
  checkText("DATABASE_URL", 1),
  checkText("JWT_SECRET", 16),
  checkUrl("SIWE_URI"),
  checkUrl("RPC_URL"),
  checkPrivateKey("BACKEND_PRIVATE_KEY"),
  checkAddress("FARM_NFT_ADDRESS"),
  checkAddress("FARM_DAO_ADDRESS"),
  checkText("PINATA_JWT", 20),
  checkUrl("IPFS_GATEWAY")
];

let hasError = false;
for (const check of checks) {
  const icon = check.ok ? "OK " : "ERR";
  console.log(`${icon} ${check.name}: ${check.message}`);
  if (!check.ok) hasError = true;
}

if (hasError) {
  console.log("\n請先修正 backend/.env 後再啟動後端。");
  process.exitCode = 1;
} else {
  console.log("\nBackend environment looks ready.");
}
