import { Router } from "express";
import asyncHandler from "express-async-handler";
import { blockchainService } from "../services/blockchainService";

export const daoRoutes = Router();

// 驗證是否為 DAO 成員
daoRoutes.get("/members/:address", asyncHandler(async (req, res) => {
  const isMember = await blockchainService.isMember(req.params.address);
  res.json({ address: req.params.address, isMember });
}));

// 取得提案列表
daoRoutes.get("/proposals", asyncHandler(async (req, res) => {
  const count = await blockchainService.getProposalCount();
  const proposals = await Promise.all(
    Array.from({ length: count }, (_, i) =>
      blockchainService.getProposal(i + 1).catch(() => null)
    )
  );
  res.json(proposals.filter(Boolean));
}));

// 取得提案詳情
daoRoutes.get("/proposals/:id", asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid proposal ID" });
    return;
  }
  const proposal = await blockchainService.getProposal(id);
  res.json(proposal);
}));

// 當前帳號是否已投票
daoRoutes.get("/proposals/:id/voted/:address", asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid proposal ID" });
    return;
  }
  const voted = await blockchainService.hasVoted(id, req.params.address);
  res.json({ proposalId: req.params.id, address: req.params.address, voted });
}));