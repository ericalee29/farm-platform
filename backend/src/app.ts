import cors from "cors";
import express, { ErrorRequestHandler } from "express";
import helmet from "helmet";
import { ZodError } from "zod";
import { authRoutes } from "./routes/authRoutes";
import { consumerRoutes } from "./routes/consumerRoutes";
import { farmerRoutes } from "./routes/farmerRoutes";
import { ipfsRoutes } from "./routes/ipfsRoutes";
import { nftRoutes } from "./routes/nftRoutes";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRoutes);
app.use("/farmer", farmerRoutes);
app.use("/ipfs", ipfsRoutes);
app.use("/nft", nftRoutes);
app.use("/consumer", consumerRoutes);

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({ error: "Invalid request body", details: error.flatten() });
  }

  console.error(error);
  return res.status(500).json({ error: error.message || "Internal server error" });
};

app.use(errorHandler);
