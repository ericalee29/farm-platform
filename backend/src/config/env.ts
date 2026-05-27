import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  SIWE_DOMAIN: z.string().min(1),
  SIWE_URI: z.string().url(),
  CHAIN_ID: z.coerce.number(),
  RPC_URL: z.string().url(),
  BACKEND_PRIVATE_KEY: z.string().startsWith("0x"),
  FARM_NFT_ADDRESS: z.string().startsWith("0x"),
  FARM_DAO_ADDRESS: z.string().startsWith("0x"),
  PINATA_JWT: z.string().min(1),
  IPFS_GATEWAY: z.string().url().default("https://gateway.pinata.cloud/ipfs")
});

export const env = envSchema.parse(process.env);
