import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthedRequest } from "../types";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : undefined;

  if (!token) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { address: string };
    (req as AuthedRequest).user = { address: payload.address };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
