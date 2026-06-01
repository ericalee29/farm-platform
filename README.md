# Farm NFT Backend + Hardhat

這個專案包含：

- `FarmNFT.sol`：ERC-721 農產品履歷 NFT，支援農民直鑄、後端代鑄、刪除、原始農民、持有人、鑄造時間與 tokenURI 查詢。
- `FarmDAO.sol`：DAO 治理，提供農民白名單申請/撤銷、暫停 mint 權限、認證標準、產品類別、metadata 必填欄位、quorum、投票期限、DAO 成員、爭議 NFT burn、metadata 更正核准等投票功能。
- `backend/`：Express API，支援 SIWE 登入、履歷暫存 PostgreSQL、圖片與 metadata 上傳 IPFS、鑄造、刪除、消費者查驗。

## DAO 治理能力

- 農民資格：新增白名單、撤銷白名單、暫停/恢復 mint 權限。
- 認證標準：更新有機認證 URI、開關產品類別、開關 metadata 必填欄位、要求碳足跡。
- 系統參數：修改 quorum、修改投票期限、新增/移除 DAO 成員。
- 爭議處理：消費者檢舉後由 DAO 投票 burn NFT；metadata 更正由 DAO 投票核准後再由後端/農民重新 mint。

## 安裝

```bash
npm install
npm --prefix backend install
```

## 合約測試

```bash
npm test
```

## 部署 Sepolia

1. 複製 `.env.example` 成 `.env`
2. 填入 `SEPOLIA_RPC_URL`、`DEPLOYER_PRIVATE_KEY`
3. 如果後端要負責代鑄與刪除，填入 `BACKEND_MINTER_ADDRESS`
4. 執行：

```bash
npm run deploy:sepolia
```

部署後把 `FarmNFT`、`FarmDAO` 位址填回 `backend/.env` 或根目錄 `.env`。

## 後端資料庫與啟動

先複製環境檔：

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

請依自己的 PostgreSQL 帳密修改 `.env` 和 `backend/.env`：

```text
DATABASE_URL=postgres://使用者名稱:密碼@localhost:5432/farm_nft
```

### Mac

Homebrew 安裝與啟動 PostgreSQL：

```bash
brew install postgresql@16
brew services start postgresql@16
createdb farm_nft
```

如果本機 PostgreSQL 使用 macOS 帳號且沒有密碼，例如使用者是 `liyuanzhong`：

```text
DATABASE_URL=postgres://liyuanzhong@127.0.0.1:5432/farm_nft
```

可以用這行快速替換：

```bash
perl -pi -e 's#postgres://postgres:postgres@localhost:5432/farm_nft#postgres://你的Mac使用者名稱@127.0.0.1:5432/farm_nft#g' .env backend/.env
```

### Windows

安裝 PostgreSQL 後，建立資料庫：

```cmd
createdb -U postgres farm_nft
```

如果安裝時設定 `postgres` 密碼為 `123456`，請在 `.env` 和 `backend/.env` 填：

```text
DATABASE_URL=postgres://postgres:123456@localhost:5432/farm_nft
```

PowerShell 快速替換範例：

```powershell
(Get-Content .env) -replace 'postgres://postgres:postgres@localhost:5432/farm_nft', 'postgres://postgres:你的密碼@localhost:5432/farm_nft' | Set-Content .env
(Get-Content backend/.env) -replace 'postgres://postgres:postgres@localhost:5432/farm_nft', 'postgres://postgres:你的密碼@localhost:5432/farm_nft' | Set-Content backend/.env
```

### 建表與啟動

```bash
npm run db:migrate
npm run check:env
npm run backend:dev
```

開啟：

```text
http://localhost:3001/health
```

看到以下結果代表後端啟動成功：

```json
{"ok":true}
```

## 本機查驗頁

不需要私鑰、不需要 Sepolia、不需要 IPFS，直接打開：

```text
viewer/index.html
```

或在專案根目錄啟動簡單靜態伺服器：

```bash
npm run viewer
```

然後打開：

```text
http://127.0.0.1:5173
```

主要 API：

- `POST /auth/nonce`
- `POST /auth/verify`
- `GET /auth/me`
- `POST /farmer/crops`
- `GET /farmer/crops`
- `GET /farmer/crops/:id`
- `PUT /farmer/crops/:id`
- `DELETE /farmer/crops/:id`
- `POST /ipfs/image`
- `POST /nft/mint`
- `DELETE /nft/:tokenId`
- `GET /consumer/tokens/:tokenId`

真實串接流程請看：

[REAL_SETUP.md](./REAL_SETUP.md)
