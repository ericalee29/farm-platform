type CropPayload = Record<string, unknown>;

export function buildFarmMetadata(params: {
  name?: string;
  description?: string;
  farmerAddress: string;
  crop: CropPayload;
  imageCid?: string;
  imageCids: string[];
  ipfsGateway: string;
}) {
  const imageUri = params.imageCid ? `ipfs://${params.imageCid}` : undefined;

  return {
    name: params.name || String(params.crop.productName || params.crop.cropName || "Farm Product NFT"),
    description: params.description || "On-chain agricultural traceability record.",
    image: imageUri,
    external_url: params.imageCid ? `${params.ipfsGateway}/${params.imageCid}` : undefined,
    attributes: [
      { trait_type: "Original Farmer", value: params.farmerAddress },
      { trait_type: "Product Name", value: params.crop.productName || params.crop.cropName || "" },
      { trait_type: "Origin", value: params.crop.origin || "" },
      { trait_type: "Harvest Date", value: params.crop.harvestDate || "" },
      { trait_type: "Batch Number", value: params.crop.batchNumber || "" },
      { trait_type: "Farm Method", value: params.crop.farmMethod || "" },
      { trait_type: "Pesticide Record", value: params.crop.pesticide || params.crop.pesticideRecord || "" }
    ].filter((item) => item.value !== ""),
    properties: {
      farmerAddress: params.farmerAddress,
      crop: params.crop,
      imageCids: params.imageCids,
      generatedAt: new Date().toISOString()
    }
  };
}
