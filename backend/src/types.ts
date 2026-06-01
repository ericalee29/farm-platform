import { Request } from "express";

export type AuthUser = {
  address: string;
};

export type AuthedRequest = Request & {
  user: AuthUser;
};
