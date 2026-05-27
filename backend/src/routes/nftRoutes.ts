import { Router } from "express";
import asyncHandler from "express-async-handler";
import { z } from "zod";
import { env } from "../config/env";
import { pool } from "../db/pool";
import { requireAuth } from "../middleware/auth";
import { blockchainService } from "../services/blockchainService";
import { ipfsService } from "../services/ipfsService";
import { AuthedRequest } from "../types";
import { normalizeAddress } from "../utils/address";
import { buildFarmMetadata } from "../utils/metadata";

export const nftRoutes = Router();

const mintSchema = z.object({
  draftId: z.string().uuid(),
  ownerAddress: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional()
});

nftRoutes.post(
  "/mint",
  requireAuth,
  asyncHandler(async (req, res) => {
    const authedReq = req as AuthedRequest;
    const body = mintSchema.parse(req.body);
    const ownerAddress = normalizeAddress(body.ownerAddress || authedReq.user.address);

    const whitelisted = await blockchainService.isWhitelistedFarmer(authedReq.user.address);
    if (!whitelisted) {
      res.status(403).json({ error: "Farmer is not DAO whitelisted" });
      return;
    }

    const draftResult = await pool.query(
      "SELECT * FROM crop_drafts WHERE id = $1 AND farmer_address = $2 AND status = 'draft'",
      [body.draftId, authedReq.user.address]
    );
    const draft = draftResult.rows[0];
    if (!draft) {
      res.status(404).json({ error: "Draft crop not found or already minted" });
      return;
    }

    const metadata = buildFarmMetadata({
      name: body.name,
      description: body.description,
      farmerAddress: authedReq.user.address,
      crop: draft.payload,
      imageCid: draft.image_cids[0],
      imageCids: draft.image_cids,
      ipfsGateway: env.IPFS_GATEWAY
    });

    const uploadedMetadata = await ipfsService.uploadJson(metadata, `farm-nft-${body.draftId}.json`);
    const minted = await blockchainService.mintForFarmer({
      farmerAddress: authedReq.user.address,
      ownerAddress,
      metadataUri: uploadedMetadata.uri
    });

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `UPDATE crop_drafts
         SET status = 'minted',
             token_id = $2,
             metadata_cid = $3,
             metadata_uri = $4,
             mint_tx_hash = $5,
             updated_at = now()
         WHERE id = $1`,
        [body.draftId, minted.tokenId, uploadedMetadata.cid, uploadedMetadata.uri, minted.txHash]
      );
      await client.query(
        `INSERT INTO nft_mints (
           token_id, crop_draft_id, farmer_address, owner_address,
           metadata_cid, metadata_uri, mint_tx_hash, minted_at_chain
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          minted.tokenId,
          body.draftId,
          authedReq.user.address,
          ownerAddress,
          uploadedMetadata.cid,
          uploadedMetadata.uri,
          minted.txHash,
          minted.mintedAt
        ]
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    res.status(201).json({
      tokenId: minted.tokenId,
      ownerAddress,
      originalFarmer: authedReq.user.address,
      metadataCid: uploadedMetadata.cid,
      metadataUri: uploadedMetadata.uri,
      metadataGatewayUrl: uploadedMetadata.gatewayUrl,
      txHash: minted.txHash,
      mintedAt: minted.mintedAt
    });
  })
);

nftRoutes.delete(
  "/:tokenId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const authedReq = req as AuthedRequest;
    const tokenInfo = await blockchainService.getTokenInfo(req.params.tokenId);
    if (!tokenInfo.exists) {
      res.status(404).json({ error: "Token does not exist" });
      return;
    }

    const caller = normalizeAddress(authedReq.user.address);
    const originalFarmer = normalizeAddress(tokenInfo.originalFarmer);
    const currentOwner = normalizeAddress(tokenInfo.currentOwner);
    if (caller !== originalFarmer && caller !== currentOwner) {
      res.status(403).json({ error: "Only original farmer or current owner can delete this NFT" });
      return;
    }

    const burned = await blockchainService.burn(req.params.tokenId);
    await pool.query(
      `UPDATE crop_drafts
       SET status = 'deleted', updated_at = now()
       WHERE token_id = $1`,
      [req.params.tokenId]
    );

    res.json({ tokenId: req.params.tokenId, txHash: burned.txHash });
  })
);
