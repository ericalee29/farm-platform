import crypto from "node:crypto";
import { Router } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { SiweMessage } from "siwe";
import { z } from "zod";
import { env } from "../config/env";
import { pool } from "../db/pool";
import { requireAuth } from "../middleware/auth";
import { AuthedRequest } from "../types";
import { normalizeAddress } from "../utils/address";

export const authRoutes = Router();

authRoutes.post(
  "/nonce",
  asyncHandler(async (req, res) => {
    const { address } = z.object({ address: z.string() }).parse(req.body);
    const normalizedAddress = normalizeAddress(address);
    const nonce = crypto.randomBytes(16).toString("hex");

    // 只在舊 nonce 已過期時才覆蓋，防止攻擊者在登入流程中途
    // 呼叫此 endpoint 強制刷新 nonce，使合法用戶的簽名失效。
    await pool.query(
      `INSERT INTO auth_nonces (address, nonce, expires_at)
       VALUES ($1, $2, now() + interval '10 minutes')
       ON CONFLICT (address)
       DO UPDATE SET nonce = EXCLUDED.nonce, expires_at = EXCLUDED.expires_at, created_at = now()
       WHERE auth_nonces.expires_at <= now()`,
      [normalizedAddress, nonce]
    );

    // 若上方 INSERT 因 WHERE 條件未執行（舊 nonce 仍有效），讀回現有 nonce 回傳
    const { rows } = await pool.query(
      "SELECT nonce FROM auth_nonces WHERE address = $1 AND expires_at > now()",
      [normalizedAddress]
    );
    res.json({ nonce: rows[0].nonce });
  })
);

authRoutes.post(
  "/verify",
  asyncHandler(async (req, res) => {
    const { message, signature } = z.object({ message: z.string(), signature: z.string() }).parse(req.body);
    const siweMessage = new SiweMessage(message);
    const normalizedAddress = normalizeAddress(siweMessage.address);

    const nonceResult = await pool.query(
      "SELECT nonce FROM auth_nonces WHERE address = $1 AND expires_at > now()",
      [normalizedAddress]
    );
    const nonce = nonceResult.rows[0]?.nonce;
    if (!nonce) {
      res.status(401).json({ error: "Nonce expired or not found" });
      return;
    }

    const verification = await siweMessage.verify({
      signature,
      domain: env.SIWE_DOMAIN,
      nonce,
      uri: env.SIWE_URI
    });

    if (!verification.success || Number(siweMessage.chainId) !== env.CHAIN_ID) {
      res.status(401).json({ error: "Invalid wallet signature" });
      return;
    }

    await pool.query("DELETE FROM auth_nonces WHERE address = $1", [normalizedAddress]);

    const token = jwt.sign({ address: normalizedAddress }, env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, address: normalizedAddress });
  })
);

authRoutes.get("/me", requireAuth, (req, res) => {
  res.json({ address: (req as AuthedRequest).user.address });
});
