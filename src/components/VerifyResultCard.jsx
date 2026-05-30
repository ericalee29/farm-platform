// src/components/VerifyResultCard.jsx
import Icon from "./CropTrustIcons";
import { IPFS_GATEWAY } from "../config/verify";

function toHttp(uri) {
  if (!uri) return "";
  return uri.startsWith("ipfs://") ? uri.replace("ipfs://", IPFS_GATEWAY) : uri;
}
function shortAddr(a) { return a ? a.slice(0, 6) + "…" + a.slice(-4) : ""; }
function fmtTime(ts) {
  const d = new Date(ts * 1000);
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}`;
}
function attr(list, key) { return list?.find((a) => a.trait_type === key)?.value ?? "—"; }

export default function VerifyResultCard({ data, meta, tokenId }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(
    window.location.origin + window.location.pathname + "?tid=" + tokenId
  )}`;

  return (
    <div className="vp-result-card">

      {/* 認證標章 */}
      <div className={`vp-ribbon ${data.farmerWhitelisted ? "ok" : "bad"}`}>
        <Icon name={data.farmerWhitelisted ? "badge-check" : "x-circle"} size={15} />
        {data.farmerWhitelisted ? "已通過 DAO 小農聯盟認證" : "此農民尚未取得 DAO 認證，請注意"}
        {data.certificationBadge && (
          <span className="code">{data.certificationBadge}</span>
        )}
      </div>

      {/* 主體：圖片 + 資料 */}
      <div className="vp-rc-body">

        {/* 左：產品圖 */}
        <div className="vp-rc-media">
          {meta?.image ? (
            <img
              src={toHttp(meta.image)}
              alt={meta?.name}
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=600";
              }}
            />
          ) : (
            <div style={{
              position: "absolute", inset: 0, background: "var(--paper-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, color: "var(--fg-3)"
            }}>無圖片</div>
          )}
          <div className="grad" />
          <div className="cap">
            <div className="ey">Token ID</div>
            <div className="tid">#{data.tokenId}</div>
            <div className="dt">上鏈：{fmtTime(data.mintedAt)}</div>
          </div>
        </div>

        {/* 右：資料 */}
        <div className="vp-rc-info">

          {/* 名稱 + SDG */}
          <div>
            <div className="vp-tagrow">
              <span className="vp-place">台灣地方創生</span>
              <div className="vp-sdgs">
                <span className="vp-sdg s12">SDG 12</span>
                <span className="vp-sdg s15">SDG 15</span>
              </div>
            </div>
            <h2>{meta?.name || "農產品 #" + data.tokenId}</h2>
          </div>

          {meta?.description && (
            <p className="vp-desc">{meta.description}</p>
          )}

          {/* 四格資料磚 */}
          <div className="vp-tiles">
            <div className="vp-tile emerald">
              <span className="k">用藥紀錄</span>
              <span className="v">{attr(meta?.attributes, "Pesticide")}</span>
            </div>
            <div className="vp-tile honey">
              <span className="k">碳足跡</span>
              <span className="v">{attr(meta?.attributes, "Carbon Footprint")}</span>
            </div>
            <div className="vp-tile neutral">
              <span className="k">農場名稱</span>
              <span className="v">{attr(meta?.attributes, "農場名稱")}</span>
            </div>
            <div className="vp-tile neutral">
              <span className="k">種植方式</span>
              <span className="v">{attr(meta?.attributes, "種植方式")}</span>
            </div>
          </div>

          {/* 鏈上地址 */}
          <div className="vp-chain">
            <div className="lbl">鏈上驗證資料</div>
            <div className="vp-addrs">
              <div className="vp-addr">
                <span className="k">鑄造農民地址</span>
                <a href={`https://sepolia.etherscan.io/address/${data.originalFarmer}`}
                   target="_blank" rel="noreferrer">
                  {shortAddr(data.originalFarmer)}
                  <Icon name="external" size={11} />
                </a>
              </div>
              <div className="vp-addr">
                <span className="k">目前持有者</span>
                <a href={`https://sepolia.etherscan.io/address/${data.currentOwner}`}
                   target="_blank" rel="noreferrer">
                  {shortAddr(data.currentOwner)}
                  <Icon name="external" size={11} />
                </a>
              </div>
            </div>
          </div>

          {/* 底部：DAO + QR */}
          <div className="vp-foot-row">
            <div className="vp-dao">
              <span className="ico">
                <Icon name="shield" size={16} />
              </span>
              <div>
                <div className="t1">小農認證聯盟 DAO 簽署</div>
                <div className="t2">鏈上資料不可竄改</div>
              </div>
            </div>
            <div className="vp-qr">
              <img src={qrUrl} alt="QR code" />
              <span>掃碼驗證</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
