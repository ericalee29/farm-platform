// src/pages/MarketingPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Icon ─────────────────────────────────────────────────────────
function MIcon({ name, size = 20 }) {
  const fillStar = name === "star";
  const paths = {
    leaf: <><path d="M11 20A7 7 0 0 1 4 13a7 7 0 0 1 7-7h7v7a7 7 0 0 1-7 7z"/><path d="M11 13 4 6"/></>,
    "shield-check": <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></>,
    sprout: <><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6c-.9.8-1.6 2-2.1 3.6-.4 1.3-.5 2.5-.4 3.7 1.4-.2 2.8-.8 3.9-1.9 1.3-1.3 2-3.3 2-5.6-1.6.1-2.6.4-3.4 1.2z"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></>,
    heart: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    "qr-code": <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3m0 4h4m0-4v4m-7-4h.01M14 21h.01"/></>,
    "badge-check": <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
    chevron: <polyline points="9 18 15 12 9 6"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={fillStar ? "currentColor" : "none"}
      stroke={fillStar ? "none" : "currentColor"}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

// ── Nav ──────────────────────────────────────────────────────────
function MkNav({ onVerify }) {
  const navigate = useNavigate();
  const links = ["首頁", "新鮮農產", "查驗履歷", "認識小農", "顧客評價"];
  return (
    <nav className="mk-nav">
      <div className="wrap mk-nav-in">
        <div className="mk-logo">
          <img src="/assets/logo-mark.svg" alt="CropTrust" />
          <span className="w">Crop<b>Chain</b></span>
        </div>
        <div className="mk-links">
          {links.map(l => <a key={l} href="#" onClick={e => e.preventDefault()}>{l}</a>)}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          
          <button 
            onClick={() => navigate("/farmer/login")}
            className="mk-cta"
            style={{ 
              backgroundColor: '#EAF5EA', 
              color: '#2E7D32', 
              border: '1px solid #C8E6C9',
            }}
          >
            農民後台 🧑‍🌾
          </button>
          
          {/* 原本的主行動按鈕 */}
          <button className="mk-cta" onClick={onVerify}>
            查驗農產品履歷
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── Hero ─────────────────────────────────────────────────────────
function MkHero({ onVerify }) {
  return (
    <header className="mk-hero">
      <div className="wrap mk-hero-grid">
        <div>
          <span className="eyebrow-pill"><MIcon name="leaf" size={14} />小農聯盟認證 · 田間履歷可查</span>
          <h1 className="mk-h1">從健康的田地，<br/>到<span className="leaf">安心</span>的餐桌</h1>
          <p className="mk-hero-sub">每一批 CropTrust 農產品都帶著一張不可竄改的田間履歷。掃描包裝上的 QR code，就能看見是哪位小農、用什麼方式、在哪片土地種出你手中的食物。</p>
          <div className="mk-hero-actions">
            <button className="btn-primary" onClick={onVerify}><MIcon name="qr-code" size={17} />查驗農產品履歷</button>
            <button className="btn-ghost" onClick={e => e.preventDefault()}>認識我們的小農</button>
          </div>
          <div className="mk-stats">
            <div className="mk-stat"><div className="k">今日採收</div><div className="v">2,400</div><div className="d">公斤 · 來自合作農場</div></div>
            <div className="mk-stat"><div className="k">認證小農</div><div className="v">128</div><div className="d">位 · DAO 白名單</div></div>
            <div className="mk-stat"><div className="k">可查驗批次</div><div className="v">98%</div><div className="d">全程上鏈履歷</div></div>
          </div>
        </div>
        <div className="mk-hero-media">
          <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=900" alt="農田" />
          <div className="mk-hero-float">
            <span className="ico"><MIcon name="shield-check" size={19} /></span>
            <div>
              <div className="t1">大湖有機草莓 · Token #1</div>
              <div className="t2">無化學農藥殘留 · DAO 認證農場</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Story ────────────────────────────────────────────────────────
function MkStory() {
  return (
    <section className="sec alt">
      <div className="wrap mk-story">
        <img src="https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&q=80&w=800" alt="小農" />
        <div>
          <span className="eyebrow-pill"><MIcon name="sprout" size={14} />我們的理念</span>
          <h2>讓每一位小農，<br/>都能被看見、被信任。</h2>
          <p>CropTrust 與台灣各地的青農、產銷班合作，用無毒與有機的方式耕作。我們把種植紀錄、農藥檢驗與碳足跡全部寫上區塊鏈——不是為了技術，而是為了讓你對手中的食物，多一份踏實的安心。</p>
          <div className="mk-mission">
            <span className="tag">100%<br/>透明</span>
            <p>我們的承諾很簡單——提供新鮮、營養、負責任種植的農產品，同時支持永續農業與在地小農社群。</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Collection ───────────────────────────────────────────────────
function MkCollection({ onVerify }) {
  const cats = ["當季水果", "新鮮蔬菜", "有機穀物", "友善畜牧", "香草與辛香料"];
  const [active, setActive] = useState(0);
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head" style={{ textAlign: "left", margin: 0, maxWidth: "none" }}>
          <span className="eyebrow-pill"><MIcon name="leaf" size={14} />新鮮農產</span>
          <h2 style={{ marginTop: 12 }}>新鮮、有機、可溯源的<br/>當季收成</h2>
        </div>
        <div className="mk-coll" style={{ marginTop: 36 }}>
          <div className="mk-coll-list">
            {cats.map((c, i) => (
              <div key={c} className={"mk-coll-item" + (i === active ? " active" : "")} onClick={() => setActive(i)}>
                {c}<MIcon name="chevron" size={16} />
              </div>
            ))}
          </div>
          <div className="mk-coll-feature">
            <img src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=900" alt={cats[active]} />
            <div className="body">
              <h3>{cats[active]}</h3>
              <p>香甜多汁、自然成熟——我們的{cats[active]}在風味最飽滿時採收，鎖住豐富色澤與營養，每一口都是田裡最真實的味道。每批皆附 CropTrust 田間履歷。</p>
              <div className="row">
                <button className="btn-primary" onClick={onVerify}><MIcon name="qr-code" size={17} />查看履歷</button>
                <button className="btn-ghost" onClick={e => e.preventDefault()}>選購當季</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Why Choose ───────────────────────────────────────────────────
function MkWhy() {
  const feats = [
    { ic: "shield-check", t: "100% 有機・無毒",  d: "所有作物自然栽培，不使用有害化學農藥或合成添加物。" },
    { ic: "sun",          t: "每日新鮮採收",      d: "每天清晨現採，確保最佳風味與營養完整送達。" },
    { ic: "sprout",       t: "永續農法",          d: "以友善環境的方式耕作，在生產好食物的同時守護土地。" },
    { ic: "badge-check",  t: "履歷全程可查",      d: "每一批產品上鏈，掃碼即可驗證來源與 DAO 認證狀態。" },
  ];
  return (
    <section className="sec paper2">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow-pill" style={{ margin: "0 auto" }}><MIcon name="leaf" size={14} />為什麼選擇 CropTrust</span>
          <h2>結合創新、永續與用心，<br/>每天交付高品質農產。</h2>
        </div>
        <div className="mk-feats">
          {feats.map(f => (
            <div className="mk-feat" key={f.t}>
              <span className="ico"><MIcon name={f.ic} size={22} /></span>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Reviews ──────────────────────────────────────────────────────
function MkReviews() {
  const rv = [
    { score: "100% 滿意", q: "自從改買 CropTrust，全家每週都吃得更新鮮、更健康，品質非常穩定。能掃碼看到產地讓我很放心。", n: "陳先生", l: "台北 · 三年訂戶", img: "https://i.pravatar.cc/80?img=12" },
    { score: "99% 新鮮保證", q: "農產品總是新鮮、美味又準時送達。CropTrust 完全改變了我們採買的習慣。", n: "林小姐", l: "新竹 · 家庭主婦", img: "https://i.pravatar.cc/80?img=32" },
    { score: "98% 回購率", q: "品質出色、味道很棒，服務也可靠。每一批都查得到履歷，我們完全信任 CropTrust。", n: "黃太太", l: "台中 · 兩個孩子的媽", img: "https://i.pravatar.cc/80?img=45" },
  ];
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow-pill" style={{ margin: "0 auto" }}><MIcon name="heart" size={14} />顧客評價</span>
          <h2>來自信任 CropTrust 的<br/>每個家庭</h2>
        </div>
        <div className="mk-reviews">
          {rv.map(r => (
            <div className="mk-review" key={r.n}>
              <div className="mk-stars">{[0,1,2,3,4].map(i => <MIcon key={i} name="star" size={16} />)}</div>
              <div className="nm">{r.score}</div>
              <p>「{r.q}」</p>
              <div className="who">
                <img src={r.img} alt="" />
                <div><div className="n">{r.n}</div><div className="l">{r.l}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Newsletter ───────────────────────────────────────────────────
function MkNewsletter() {
  return (
    <section className="mk-cta-band">
      <div className="wrap">
        <h2>跟上每一季的新鮮收成</h2>
        <p>訂閱 CropTrust，搶先收到當季優惠、田間採收快訊、健康食譜與小農故事。</p>
        <form className="mk-news" onSubmit={e => e.preventDefault()}>
          <input type="email" placeholder="輸入你的 Email" />
          <button type="submit">立即訂閱</button>
        </form>
      </div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────────
function MkFooter({ onVerify }) {
  const cols = [
    { h: "農產品", items: ["當季水果", "新鮮蔬菜", "有機穀物", "香草辛香料"] },
    { h: "關於",   items: ["我們的理念", "合作小農", "永續報告", "聯絡我們"] },
    { h: "信任",   items: ["田間履歷查驗", "小農聯盟 DAO", "認證標準", "常見問題"] },
  ];
  return (
    <footer className="mk-footer">
      <div className="wrap">
        <div className="mk-footer-grid">
          <div>
            <div className="mk-logo">
              <img src="/assets/logo-mark.svg" alt="CropTrust" />
              <span className="w">Crop<b>Trust</b></span>
            </div>
            <p className="about">從健康的田地到安心的餐桌——CropTrust 讓每一批農產品的種植故事，都能被你親眼查驗。</p>
          </div>
          {cols.map(c => (
            <div className="col" key={c.h}>
              <h4>{c.h}</h4>
              {c.items.map(it => (
                <a key={it} href="#" onClick={it === "田間履歷查驗" ? (e) => { e.preventDefault(); onVerify(); } : e => e.preventDefault()}>
                  {it}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="mk-footer-bottom">
          <span>© 2026 CropTrust · 小農聯盟田間履歷平台</span>
          <span>隱私權政策 · 服務條款 · Sepolia Testnet</span>
        </div>
      </div>
    </footer>
  );
}

// ── 主頁 ─────────────────────────────────────────────────────────
export default function MarketingPage() {
  const navigate = useNavigate();
  const goVerify = () => navigate("/verify");

  return (
    <div className="mk">
      <MkNav       onVerify={goVerify} />
      <MkHero      onVerify={goVerify} />
      <MkStory />
      <MkCollection onVerify={goVerify} />
      <MkWhy />
      <MkReviews />
      <MkNewsletter />
      <MkFooter    onVerify={goVerify} />
    </div>
  );
}
