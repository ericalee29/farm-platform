# Farm NFT 真實串接流程

這份文件是從 demo 進到真實後端流程的 checklist。

## 0. 目前已完成

- Hardhat 合約測試：`npm test`
- 本機合約 demo：`npm run demo:local`
- 查驗頁 demo：`npm run viewer`
- 後端程式碼、API、資料庫 migration 都已建立

## 1. 準備 PostgreSQL

如果有 Docker：

```bash
npm run db:up
npm run db:migrate
```

如果沒有 Docker，請先安裝 PostgreSQL，建立資料庫：

```sql
CREATE DATABASE farm_nft;
```

確認 `backend/.env`：

```text
DATABASE_URL=postgres://postgres:postgres@localhost:5432/farm_nft
```

建立資料表：

```bash
npm run db:migrate
```

## 2. 準備測試錢包

在 MetaMask 新增一個「測試用帳號」，不要使用主錢包。

你需要：

```text
測試錢包地址：0x...
測試錢包私鑰：0x + 64 個十六進位字元
```

`.env`：

```text
DEPLOYER_PRIVATE_KEY=0x你的測試錢包私鑰
BACKEND_MINTER_ADDRESS=0x你的測試錢包地址
```

`backend/.env`：

```text
BACKEND_PRIVATE_KEY=0x你的測試錢包私鑰
```

也可以用指令確認私鑰對應的地址：

```bash
npm run wallet:address
```

## 3. 準備 Sepolia RPC

申請 Infura 或 Alchemy 的 Sepolia RPC。

`.env`：

```text
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/你的ProjectId
```

`backend/.env`：

```text
RPC_URL=https://sepolia.infura.io/v3/你的ProjectId
CHAIN_ID=11155111
```

測試錢包需要有 Sepolia 測試 ETH，才能部署合約與 mint。

## 4. 準備 Pinata JWT

申請 Pinata API Key / JWT，填入：

`backend/.env`：

```text
PINATA_JWT=你的PinataJWT
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs
```

## 5. 檢查環境

```bash
npm run check:env
```

如果還有 `ERR`，照訊息補齊 `backend/.env`。

## 6. 部署合約到 Sepolia

```bash
npm run deploy:sepolia
```

部署後會看到：

```text
FarmDAO: 0x...
FarmNFT: 0x...
```

把地址填到 `backend/.env`：

```text
FARM_DAO_ADDRESS=0x部署後的FarmDAO地址
FARM_NFT_ADDRESS=0x部署後的FarmNFT地址
```

再跑一次：

```bash
npm run check:env
```

## 7. 啟動後端

```bash
npm run backend:dev
```

看到這行代表成功：

```text
Farm NFT backend listening on port 3001
```

測試：

```text
http://localhost:3001/health
```

## 8. 真實流程 API

- `POST /auth/nonce`
- `POST /auth/verify`
- `POST /farmer/crops`
- `POST /ipfs/image`
- `POST /nft/mint`
- `DELETE /nft/:tokenId`
- `GET /consumer/tokens/:tokenId`

## 9. DAO 治理功能

`FarmDAO.sol` 已支援：

- `proposeFarmer`：新農民申請白名單。
- `proposeFarmerRemoval`：撤銷問題農民白名單。
- `proposeFarmerMintPause`：暫停或恢復農民 mint 權限。
- `proposeOrganicCertificationURI`：修改有機認證標準 URI。
- `proposeProductCategory`：新增或關閉農產品類別。
- `proposeRequiredMetadataField`：調整 metadata 必填欄位。
- `proposeCarbonFootprintRequired`：是否強制要求碳足跡。
- `proposeQuorum`：修改 quorum。
- `proposeVotingPeriod`：修改投票期限。
- `proposeMember`：新增或移除 DAO 成員。
- `proposeBurnToken`：爭議產品由 DAO 投票 burn NFT。
- `proposeMetadataCorrection`：核准 metadata 更正，供後端 burn 舊 NFT 後重新 mint。

## 重要提醒

不要把私鑰貼到聊天、GitHub 或截圖裡。只放在本機 `.env`。
