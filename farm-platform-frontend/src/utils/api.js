// Centralized API layer — all backend calls go through here.
// Routes all requests to Vite proxy /api → http://localhost:3001

const BASE = '/api'

// ── JWT storage ───────────────────────────────────────────────────
export const token = {
  get:   ()    => localStorage.getItem('farm_jwt'),
  set:   (t)   => localStorage.setItem('farm_jwt', t),
  clear: ()    => localStorage.removeItem('farm_jwt'),
}

// ── Base fetch with optional auth header ─────────────────────────
async function apiFetch(path, opts = {}) {
  const jwt = token.get()
  const isFormData = opts.body instanceof FormData

  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(jwt && { Authorization: `Bearer ${jwt}` }),
      ...(opts.headers || {}),
    },
  })

  // 204 No Content — return null without parsing
  if (res.status === 204) return null

  const data = await res.json().catch(() => ({ error: res.statusText }))
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

// ── Auth (SIWE) ───────────────────────────────────────────────────
export const auth = {
  /** Request a fresh nonce for the given wallet address */
  nonce: (address) =>
    apiFetch('/auth/nonce', {
      method: 'POST',
      body: JSON.stringify({ address }),
    }),

  /** Exchange a signed SIWE message for a JWT */
  verify: (message, signature) =>
    apiFetch('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ message, signature }),
    }),

  /** Validate stored JWT and return logged-in address */
  me: () => apiFetch('/auth/me'),
}

// ── Farmer crops (drafts) ─────────────────────────────────────────
export const farmer = {
  /** Load all crop drafts for the logged-in farmer */
  getCrops: () => apiFetch('/farmer/crops'),

  /** Create a new crop draft */
  createCrop: (payload, imageCids = []) =>
    apiFetch('/farmer/crops', {
      method: 'POST',
      body: JSON.stringify({ payload, imageCids }),
    }),

  /** Update an existing draft (only works while status = 'draft') */
  updateCrop: (id, payload, imageCids) =>
    apiFetch(`/farmer/crops/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        payload,
        ...(imageCids !== undefined && { imageCids }),
      }),
    }),

  /** Soft-delete a draft */
  deleteCrop: (id) =>
    apiFetch(`/farmer/crops/${id}`, { method: 'DELETE' }),
}

// ── IPFS image upload ─────────────────────────────────────────────
export const ipfs = {
  /** Upload an image File to IPFS via backend.
   *  Returns { cid, uri, gatewayUrl } */
  uploadImage: (file) => {
    const form = new FormData()
    form.append('file', file)
    return apiFetch('/ipfs/image', { method: 'POST', body: form })
  },
}

// ── NFT ───────────────────────────────────────────────────────────
export const nft = {
  /** Mint an NFT from an existing draft.
   *  Returns { tokenId, txHash, metadataUri, ... } */
  mint: ({ draftId, name, description }) =>
    apiFetch('/nft/mint', {
      method: 'POST',
      body: JSON.stringify({ draftId, name, description }),
    }),

  /** Burn (delete) an on-chain NFT */
  burn: (tokenId) =>
    apiFetch(`/nft/${tokenId}`, { method: 'DELETE' }),
}

// ── DAO ───────────────────────────────────────────────────────────
export const dao = {
  /** Dev shortcut: add address as DAO member without governance vote */
  devAddMember: (address) =>
    apiFetch('/dao/dev/add-member', {
      method: 'POST',
      body: JSON.stringify({ address }),
    }),
}

// ── Consumer (public) ─────────────────────────────────────────────
export const consumer = {
  /** Look up on-chain token info — no auth required */
  getToken: (tokenId) => apiFetch(`/consumer/tokens/${tokenId}`),
}
