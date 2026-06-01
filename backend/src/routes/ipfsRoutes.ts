import { Router } from "express";
import asyncHandler from "express-async-handler";
import multer from "multer";
import { requireAuth } from "../middleware/auth";
import { ipfsService } from "../services/ipfsService";

export const ipfsRoutes = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

ipfsRoutes.post(
  "/image",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "Missing file field" });
      return;
    }
    if (!req.file.mimetype.startsWith("image/")) {
      res.status(400).json({ error: "Only image files are allowed" });
      return;
    }

    const result = await ipfsService.uploadFile(req.file);
    res.status(201).json(result);
  })
);
