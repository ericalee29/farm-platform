import { env } from "../config/env";

type PinataFileResponse = {
  IpfsHash: string;
};

export class IpfsService {
  async uploadJson(json: unknown, name: string) {
    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.PINATA_JWT}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pinataMetadata: { name },
        pinataContent: json
      })
    });

    if (!response.ok) {
      throw new Error(`IPFS JSON upload failed: ${response.status} ${await response.text()}`);
    }

    const result = (await response.json()) as PinataFileResponse;
    return {
      cid: result.IpfsHash,
      uri: `ipfs://${result.IpfsHash}`,
      gatewayUrl: `${env.IPFS_GATEWAY}/${result.IpfsHash}`
    };
  }

  async unpin(cid: string): Promise<void> {
    const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${env.PINATA_JWT}` }
    });
    // 404 代表已不存在，不視為錯誤
    if (!response.ok && response.status !== 404) {
      throw new Error(`IPFS unpin failed: ${response.status} ${await response.text()}`);
    }
  }

  async uploadFile(file: Express.Multer.File) {
    const form = new FormData();
    const arrayBuffer = file.buffer.buffer.slice(
      file.buffer.byteOffset,
      file.buffer.byteOffset + file.buffer.byteLength
    ) as ArrayBuffer;
    form.append("file", new Blob([arrayBuffer], { type: file.mimetype }), file.originalname);
    form.append("pinataMetadata", JSON.stringify({ name: file.originalname }));

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.PINATA_JWT}`
      },
      body: form
    });

    if (!response.ok) {
      throw new Error(`IPFS file upload failed: ${response.status} ${await response.text()}`);
    }

    const result = (await response.json()) as PinataFileResponse;
    return {
      cid: result.IpfsHash,
      uri: `ipfs://${result.IpfsHash}`,
      gatewayUrl: `${env.IPFS_GATEWAY}/${result.IpfsHash}`
    };
  }
}

export const ipfsService = new IpfsService();
