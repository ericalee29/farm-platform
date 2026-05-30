// src/components/VerifySearchPanel.jsx
import { useRef, useState } from "react";
import Icon from "./CropTrustIcons";

export default function VerifySearchPanel({ tokenId, setTokenId, onSearch, loading }) {
  const [scanning, setScanning] = useState(false);
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const scannerRef = useRef(null);

  async function startScan() {
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      const mod    = await import("https://esm.sh/@zxing/browser@0.1.5");
      const reader = new mod.BrowserMultiFormatReader();
      scannerRef.current = reader;
      reader.decodeFromVideoElement(videoRef.current, (result) => {
        if (!result) return;
        const text  = result.getText();
        const match = text.match(/tid=(\d+)|\/(\d+)$/);
        const id    = match ? (match[1] || match[2]) : text.trim();
        setTokenId(id);
        stopScan();
        onSearch(id);
      });
    } catch (e) {
      setScanning(false);
      alert("無法開啟相機：" + e.message);
    }
  }

  function stopScan() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current  = null;
    scannerRef.current?.reset?.();
    scannerRef.current = null;
    setScanning(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSearch(tokenId);
  }

  return (
    <aside className="vp-rail">

      {/* 深色介紹卡 */}
      <div className="vp-intro">
        <h2>田間履歷驗證</h2>
        <p>
          輸入農產品包裝上的 Token ID，即可查閱存放在區塊鏈上的完整種植紀錄，
          包含農藥檢驗、碳足跡、以及小農聯盟 DAO 的認證狀態。
        </p>
      </div>

      {/* 查詢輸入卡 */}
      <div className="vp-card vp-pad">
        <div className="vp-eyebrow">輸入產品 Token ID</div>

        <form onSubmit={handleSubmit}>
          <div className="vp-field">
            <input
              type="number"
              min="0"
              placeholder="例如：1 或 2"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
            />
            <button type="submit" className="vp-btn vp-btn-primary" disabled={loading}>
              查詢
            </button>
          </div>

          <button
            type="button"
            className="vp-btn vp-btn-scan"
            onClick={scanning ? stopScan : startScan}
          >
            <Icon name="qr-code" size={15} />
            {scanning ? "停止掃描" : "掃描 QR code"}
          </button>
        </form>

        {/* QR 掃描視窗 */}
        {scanning && (
          <div className="vp-scan-box" style={{ marginTop: 12 }}>
            <video ref={videoRef} autoPlay playsInline muted
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div className="frame">
              <div className="laser" />
            </div>
            <p className="hint">對準 QR code</p>
          </div>
        )}

        {/* 快速測試按鈕 */}
        <div className="vp-quick">
          <div className="vp-eyebrow">快速體驗（Demo）</div>
          <div className="vp-quick-grid" style={{ marginTop: 9 }}>
            {[
              { id: "1", label: "🍓 #1 大湖草莓" },
              { id: "2", label: "🍅 #2 埔里番茄" },
            ].map(({ id, label }) => (
              <button key={id} className="vp-chip"
                onClick={() => { setTokenId(id); onSearch(id); }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 說明小卡 */}
      <div className="vp-card vp-pad">
        <div className="vp-eyebrow" style={{ marginBottom: 12 }}>資料來源說明</div>
        <div className="vp-notes">
          {[
            "Token ID 對應一批農產品，由農民在後台鑄造時產生",
            "所有資料透過後端 API 讀取鏈上狀態，不需要連接錢包",
            "DAO 認證代表農民已通過小農聯盟白名單投票審核",
          ].map((text, i) => (
            <div key={i} className="vp-note">
              <span className="num">{"①②③"[i]}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
