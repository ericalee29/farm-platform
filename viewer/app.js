const demoTokens = {
  "1": {
    tokenId: "1",
    exists: true,
    tokenUri: "ipfs://demo-farm-metadata-cid",
    metadataUrl: "https://gateway.pinata.cloud/ipfs/demo-farm-metadata-cid",
    originalFarmer: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    currentOwner: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    farmerWhitelisted: true,
    certificationBadge: "DAO_VERIFIED_FARMER",
    mintedAt: "1779872838"
  }
};

const form = document.querySelector("#lookupForm");
const tokenInput = document.querySelector("#tokenId");
const result = document.querySelector("#result");
const statusText = document.querySelector("#statusText");

function formatTimestamp(value) {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return "尚未取得";
  }

  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Asia/Taipei"
  }).format(new Date(timestamp * 1000));
}

function renderToken(token) {
  result.innerHTML = `
    <article class="result-card">
      <p class="card-label">Token ID</p>
      <p class="card-value">#${token.tokenId}</p>
    </article>
    <article class="result-card">
      <p class="card-label">DAO 認證</p>
      <p class="card-value"><span class="badge">${token.certificationBadge}</span></p>
    </article>
    <article class="result-card full">
      <p class="card-label">IPFS Metadata</p>
      <p class="card-value">${token.tokenUri}</p>
    </article>
    <article class="result-card full">
      <p class="card-label">Metadata Gateway</p>
      <p class="card-value">${token.metadataUrl}</p>
    </article>
    <article class="result-card">
      <p class="card-label">原始鑄造農民地址</p>
      <p class="card-value">${token.originalFarmer}</p>
    </article>
    <article class="result-card">
      <p class="card-label">目前持有人地址</p>
      <p class="card-value">${token.currentOwner}</p>
    </article>
    <article class="result-card">
      <p class="card-label">Token 有效性</p>
      <p class="card-value">存在，可查驗</p>
    </article>
    <article class="result-card">
      <p class="card-label">上鏈時間</p>
      <p class="card-value">${formatTimestamp(token.mintedAt)}</p>
    </article>
  `;
}

function renderMissing(tokenId) {
  result.innerHTML = `
    <article class="result-card error">
      <p class="card-label">Token 查驗結果</p>
      <p class="card-value">找不到 Token ID #${tokenId}。目前 demo 只建立 Token ID 1。</p>
    </article>
  `;
}

function lookupToken(tokenId) {
  const cleanTokenId = tokenId.trim();
  const token = demoTokens[cleanTokenId];

  if (token) {
    statusText.textContent = "Token 存在，已完成鏈上欄位查驗。";
    renderToken(token);
    return;
  }

  statusText.textContent = "Token 不存在或尚未鑄造。";
  renderMissing(cleanTokenId || "空白");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  lookupToken(tokenInput.value);
});

lookupToken(tokenInput.value);
