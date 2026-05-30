export const API_BASE      = "http://localhost:3001/api";
export const IPFS_GATEWAY  = "https://cloudflare-ipfs.com/ipfs/";

export const MOCK_DATA = {
  "1": {
    tokenId: "1", exists: true, metadataUrl: null,
    originalFarmer: "0x39E0a23Cb7D1F2320ab99B228B108B99EcdA01A2",
    currentOwner:   "0x39E0a23Cb7D1F2320ab99B228B108B99EcdA01A2",
    farmerWhitelisted: true, certificationBadge: "DAO_VERIFIED_FARMER",
    mintedAt: 1779549553,
    _meta: {
      name: "大湖有機草莓（香水品種）",
      description: "由苗栗大湖青農陳小川以無毒有機方式栽種。草莓果肉扎實、香氣濃郁，無任何化學農藥殘留，經小農聯盟 DAO 全票通過認證。",
      image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=600",
      attributes: [
        { trait_type: "農場名稱", value: "陳家有機農場" },
        { trait_type: "種植方式", value: "有機栽培" },
        { trait_type: "Pesticide", value: "無化學農藥殘留（ND 未檢出）" },
        { trait_type: "Carbon Footprint", value: "0.24 kg CO₂e / 公斤" },
      ],
    },
  },
  "2": {
    tokenId: "2", exists: true, metadataUrl: null,
    originalFarmer: "0x98FA230cb7d1f2320ab99b228b108b99ecda01fa",
    currentOwner:   "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
    farmerWhitelisted: true, certificationBadge: "DAO_VERIFIED_FARMER",
    mintedAt: 1779500079,
    _meta: {
      name: "埔里高山水果番茄（溫室無毒）",
      description: "產自南投埔里海拔 650 公尺無毒網室，山泉水灌溉，甜度高達 8.5 度，全程有機氮肥施作。",
      image: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=600",
      attributes: [
        { trait_type: "農場名稱", value: "埔里綠光產銷班" },
        { trait_type: "種植方式", value: "溫室無毒栽培" },
        { trait_type: "Pesticide", value: "天然生物防治（零化學農藥）" },
        { trait_type: "Carbon Footprint", value: "0.18 kg CO₂e / 公斤" },
      ],
    },
  },
};
