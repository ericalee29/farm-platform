// src/pages/VerifyPage.jsx
import { useState, useEffect } from "react";
import VerifySearchPanel from "../components/VerifySearchPanel";
import VerifyResultCard  from "../components/VerifyResultCard";
import Icon              from "../components/CropTrustIcons";
import { API_BASE, IPFS_GATEWAY, MOCK_DATA } from "../config/verify";

function toHttp(uri) {
  return uri?.startsWith("ipfs://") ? uri.replace("ipfs://", IPFS_GATEWAY) : uri;
}

export default function VerifyPage() {
  const [tokenId,  setTokenId]  = useState("");
  const [demoMode, setDemoMode] = useState(true);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [data,     setData]     = useState(null);
  const [meta,     setMeta]     = useState(null);

  useEffect(() => {
    const tid = new URLSearchParams(window.location.search).get("tid");
    if (tid) { setTokenId(tid); search(tid, true); }
  }, []);

  async function search(sid, useDemo = demoMode) {
    const id = String(sid).trim();
    if (!id) { setError("請輸入 Token ID"); return; }
    setLoading(true); setError(null); setData(null); setMeta(null);

    if (useDemo) {
      await new Promise((r) => setTimeout(r, 600));
      const mock = MOCK_DATA[id];
      if (mock) { setData(mock); setMeta(mock._meta); }
      else setError(`Demo 模式目前只有 Token 1 和 2，請輸入這兩個數字，或切換為鏈上模式。`);
      setLoading(false);
      return;
    }

    try {
      const res  = await fetch(`${API_BASE}/consumer/tokens/${id}`);
      const json = await res.json();
      if (!res.ok || !json.exists) {
        setError(`找不到 Token #${id}，請確認 ID 是否正確。`);
        setLoading(false);
        return;
      }
      setData(json);
      if (json.metadataUrl) {
        const mRes = await fetch(toHttp(json.metadataUrl));
        if (mRes.ok) setMeta(await mRes.json());
      }
    } catch {
      setError("無法連線到後端伺服器。請確認後端已啟動，或切換為 Demo 模式。");
    }
    setLoading(false);
  }

  return (
    <div className="vp-app">

      {/* Header */}
      <header className="vp-header">
        <div className="vp-header-in">

          <div className="vp-logo">
            <img src="/assets/logo-mark.svg" alt="CropTrust" />
            <span className="word">Crop<b>Trust</b></span>
            <span className="sub">消費者查驗通道</span>
          </div>

          <div className="vp-mode">
            <div className="vp-seg">
              <button
                className={demoMode ? "demo-on" : ""}
                onClick={() => { setDemoMode(true);  setData(null); setError(null); }}>
                Demo
              </button>
              <button
                className={!demoMode ? "live-on" : ""}
                onClick={() => { setDemoMode(false); setData(null); setError(null); }}>
                鏈上查詢
              </button>
            </div>
            <span className={`vp-statuspill ${demoMode ? "demo" : "live"}`}>
              {demoMode ? "模擬模式" : "Sepolia 測試網"}
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="vp-main">

        <VerifySearchPanel
          tokenId={tokenId}
          setTokenId={setTokenId}
          onSearch={(id) => search(id)}
          loading={loading}
        />

        <section className="vp-result">
          {error   && <VPError   message={error} />}
          {loading && <VPLoading demoMode={demoMode} />}
          {!data && !loading && !error && <VPEmpty />}
          {data  && !loading && <VerifyResultCard data={data} meta={meta} tokenId={tokenId} />}
        </section>
      </main>

      {/* Footer */}
      <footer className="vp-footer">
        <div className="vp-footer-in">
          <span>© 2026 CropTrust — 政治大學 Web3 期末專案小組</span>
          <div className="vp-footer-links">
            <a href="https://sepolia.etherscan.io/address/0x4E10ce681F5e804e8cdcAd850918f4e40301E91d"
               target="_blank" rel="noreferrer">FarmNFT 合約</a>
            <span>·</span>
            <a href="https://sepolia.etherscan.io/address/0x384698AdB6126b6eabB705a9132dd80dbf8275D0"
               target="_blank" rel="noreferrer">FarmDAO 合約</a>
            <span>·</span>
            <span className="vp-testnet">Sepolia Testnet</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── 狀態元件（只在這頁用）──────────────────────────────────────────
function VPEmpty() {
  return (
    <div className="vp-empty">
      <div className="ic"><Icon name="leaf" size={28} /></div>
      <h3>等待查驗</h3>
      <p>在左側輸入 Token ID，或掃描產品包裝上的 QR code</p>
      <div className="vp-flow">
        <span>輸入 Token ID</span>
        <span className="arr">→</span>
        <span>查詢後端 API</span>
        <span className="arr">→</span>
        <span>顯示田間履歷</span>
      </div>
    </div>
  );
}

function VPLoading({ demoMode }) {
  return (
    <div className="vp-card vp-loading">
      <Icon name="loader" size={18} style={{ color: "var(--green-500)" }} />
      {demoMode ? "載入 Demo 資料中…" : "查詢鏈上資料中…"}
    </div>
  );
}

function VPError({ message }) {
  return (
    <div className="vp-error">
      <Icon name="alert" size={16} />
      <p>{message}</p>
    </div>
  );
}
