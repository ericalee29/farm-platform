CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS auth_nonces (
  address TEXT PRIMARY KEY,
  nonce TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crop_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_address TEXT NOT NULL,
  payload JSONB NOT NULL,
  image_cids TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'minted', 'deleted')),
  token_id NUMERIC,
  metadata_cid TEXT,
  metadata_uri TEXT,
  mint_tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crop_drafts_farmer_address ON crop_drafts (farmer_address);
CREATE INDEX IF NOT EXISTS idx_crop_drafts_token_id ON crop_drafts (token_id);

CREATE TABLE IF NOT EXISTS nft_mints (
  token_id NUMERIC PRIMARY KEY,
  crop_draft_id UUID REFERENCES crop_drafts(id),
  farmer_address TEXT NOT NULL,
  owner_address TEXT NOT NULL,
  metadata_cid TEXT NOT NULL,
  metadata_uri TEXT NOT NULL,
  mint_tx_hash TEXT NOT NULL,
  minted_at_chain NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
