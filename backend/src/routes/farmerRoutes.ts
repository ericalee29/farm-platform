import { Router } from "express";
import asyncHandler from "express-async-handler";
import { z } from "zod";
import { pool } from "../db/pool";
import { requireAuth } from "../middleware/auth";
import { AuthedRequest } from "../types";

export const farmerRoutes = Router();

const cropPayloadSchema = z.record(z.unknown());
const cropDraftSchema = z.object({
  payload: cropPayloadSchema,
  imageCids: z.array(z.string()).default([])
});

farmerRoutes.use(requireAuth);

farmerRoutes.post(
  "/crops",
  asyncHandler(async (req, res) => {
    const authedReq = req as AuthedRequest;
    const body = cropDraftSchema.parse(req.body);
    const result = await pool.query(
      `INSERT INTO crop_drafts (farmer_address, payload, image_cids)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [authedReq.user.address, body.payload, body.imageCids]
    );

    res.status(201).json(result.rows[0]);
  })
);

farmerRoutes.get(
  "/crops",
  asyncHandler(async (req, res) => {
    const authedReq = req as AuthedRequest;
    const result = await pool.query(
      `SELECT * FROM crop_drafts
       WHERE farmer_address = $1
       ORDER BY created_at DESC`,
      [authedReq.user.address]
    );

    res.json(result.rows);
  })
);

farmerRoutes.get(
  "/crops/:id",
  asyncHandler(async (req, res) => {
    const authedReq = req as AuthedRequest;
    const result = await pool.query(
      "SELECT * FROM crop_drafts WHERE id = $1 AND farmer_address = $2",
      [req.params.id, authedReq.user.address]
    );

    if (!result.rowCount) {
      res.status(404).json({ error: "Crop draft not found" });
      return;
    }

    res.json(result.rows[0]);
  })
);

farmerRoutes.put(
  "/crops/:id",
  asyncHandler(async (req, res) => {
    const authedReq = req as AuthedRequest;
    const body = cropDraftSchema.partial().parse(req.body);
    const current = await pool.query(
      "SELECT * FROM crop_drafts WHERE id = $1 AND farmer_address = $2 AND status = 'draft'",
      [req.params.id, authedReq.user.address]
    );

    if (!current.rowCount) {
      res.status(404).json({ error: "Editable crop draft not found" });
      return;
    }

    const result = await pool.query(
      `UPDATE crop_drafts
       SET payload = COALESCE($3, payload),
           image_cids = COALESCE($4, image_cids),
           updated_at = now()
       WHERE id = $1 AND farmer_address = $2
       RETURNING *`,
      [req.params.id, authedReq.user.address, body.payload ?? null, body.imageCids ?? null]
    );

    res.json(result.rows[0]);
  })
);

farmerRoutes.delete(
  "/crops/:id",
  asyncHandler(async (req, res) => {
    const authedReq = req as AuthedRequest;
    const result = await pool.query(
      `UPDATE crop_drafts
       SET status = 'deleted', updated_at = now()
       WHERE id = $1 AND farmer_address = $2 AND status = 'draft'
       RETURNING id`,
      [req.params.id, authedReq.user.address]
    );

    if (!result.rowCount) {
      res.status(404).json({ error: "Draft crop was not found or is already minted" });
      return;
    }

    res.status(204).send();
  })
);
