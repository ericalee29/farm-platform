import { Router } from "express";
import asyncHandler from "express-async-handler";
import { env } from "../config/env";
import { blockchainService } from "../services/blockchainService";

export const consumerRoutes = Router();

function toGatewayUrl(tokenUri: string) {
  if (!tokenUri.startsWith("ipfs://")) {
    return tokenUri;
  }
  return `${env.IPFS_GATEWAY}/${tokenUri.replace("ipfs://", "")}`;
}

consumerRoutes.get(
  "/tokens/:tokenId",
  asyncHandler(async (req, res) => {
    const info = await blockchainService.getTokenInfo(req.params.tokenId);
    if (!info.exists) {
      res.status(404).json({
        tokenId: req.params.tokenId,
        exists: false
      });
      return;
    }

    res.json({
      tokenId: req.params.tokenId,
      exists: true,
      tokenUri: info.tokenUri,
      metadataUrl: toGatewayUrl(info.tokenUri),
      originalFarmer: info.originalFarmer,
      currentOwner: info.currentOwner,
      farmerWhitelisted: info.farmerWhitelisted,
      certificationBadge: info.farmerWhitelisted ? "DAO_VERIFIED_FARMER" : null,
      mintedAt: info.mintedAt
    });
  })
);
