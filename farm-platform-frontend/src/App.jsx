import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

import MarketingPage from "./pages/MarketingPage";
import VerifyPage    from "./pages/VerifyPage";
import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerLogin from "./pages/FarmerLogin";
import DAOPage from "./pages/DAOPage";
import ProposalDetail from "./pages/ProposalDetail";
import Sidebar from "./components/Sidebar";
import FarmRecordForm from "./components/FarmRecordForm";
import DraftTable from "./components/DraftTable";
import Header from "./components/Header";
import { getReadContract } from "./utils/contract";
import { auth, farmer, ipfs, nft, token } from "./utils/api";

// ── Helpers ───────────────────────────────────────────────────────

/** Convert a crop_drafts DB row → UI draft shape */
function rowToDraft(row) {
  const p = row.payload || {};
  return {
    id:           row.id,
    batch:        p.batchName    || "",
    crop:         p.cropName     || "",
    cropValue:    p.cropType     || "Guava",
    isCustomCrop: p.isCustomCrop || false,
    pesticideName:p.pesticideName|| "",
    imageUrl:     p.imageUrl     || "",
  };
}

/** Convert a minted crop_drafts DB row → UI nft shape */
function rowToNFT(row) {
  const p = row.payload || {};
  const cropName = p.cropName || "農產品";
  return {
    id:      String(row.token_id ?? row.id),
    crop:    `${cropName} #${p.batchName || ""}`,
    txHash:  row.mint_tx_hash || "",
    date:    row.updated_at ? new Date(row.updated_at).toISOString().split("T")[0] : "",
    status:  "On-Chain",
  };
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [walletConnected,   setWalletConnected]   = useState(false);
  const [siweAuthenticated, setSiweAuthenticated] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  // DAO wallet state (MetaMask account for DAO read/write)
  const [account,       setAccount]       = useState(null);
  const [isDAO,         setIsDAO]         = useState(false);
  const [daoSelectedProposal, setDaoSelectedProposal] = useState(null);

  // Drafts暫存 & NFT 資產
  const [drafts, setDrafts] = useState([]);
  const [nfts,   setNfts]   = useState([]);

  // Modal state
  const [modalType,             setModalType]             = useState(null);
  const [currentMintingTokenId, setCurrentMintingTokenId] = useState("");
  const [modalMessage,          setModalMessage]          = useState("");

  // Active form data
  const [formData, setFormData] = useState({
    id: "", batchName: "", cropType: "Guava", customCrop: "",
    isCustomCrop: false, pesticideName: "", imageUrl: "", rawFile: null,
  });

  // ── DAO MetaMask listener ────────────────────────────────────────
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts[0]) setAccount(accounts[0]);
    });
    window.ethereum.on("accountsChanged", (accounts) => {
      setAccount(accounts[0] ?? null);
    });
  }, []);

  useEffect(() => {
    if (!account) { setIsDAO(false); return; }
    getReadContract()
      .then(async (c) => {
        const { ethers } = await import("ethers");
        const MEMBER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MEMBER_ROLE"));
        return c.hasRole(MEMBER_ROLE, account);
      })
      .then(setIsDAO)
      .catch(() => setIsDAO(false));
  }, [account]);

  useEffect(() => {
    if (currentPage !== "dao") setDaoSelectedProposal(null);
  }, [currentPage]);

  // ── Restore session from stored JWT ─────────────────────────────
  useEffect(() => {
    if (!token.get()) return;
    auth.me()
      .then(() => {
        setWalletConnected(true);
        setSiweAuthenticated(true);
        return loadFarmerData();
      })
      .catch(() => token.clear());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load drafts + NFTs from backend ─────────────────────────────
  async function loadFarmerData() {
    try {
      const crops = await farmer.getCrops();
      setDrafts(crops.filter((c) => c.status === "draft").map(rowToDraft));
      setNfts(  crops.filter((c) => c.status === "minted").map(rowToNFT));
    } catch (e) {
      console.error("loadFarmerData:", e.message);
    }
  }

  // ── Navigation helpers ───────────────────────────────────────────
  const handleAddNewRecord = () => {
    setFormData({ id: "", batchName: "", cropType: "Guava", customCrop: "",
                  isCustomCrop: false, pesticideName: "", imageUrl: "", rawFile: null });
    setCurrentPage("records");
  };

  const handleSelectDraft = (draft) => {
    setFormData({
      id:           draft.id,
      batchName:    draft.batch,
      cropType:     draft.cropValue,
      isCustomCrop: draft.isCustomCrop || false,
      customCrop:   draft.isCustomCrop ? draft.crop : "",
      pesticideName:draft.pesticideName,
      imageUrl:     draft.imageUrl || "",
      rawFile:      null,
    });
    setCurrentPage("records");
  };

  // ── Save / update draft ──────────────────────────────────────────
  const handleSaveDraft = async () => {
    if (!formData.batchName) { alert("請輸入批次編號！"); return; }

    const cropName = formData.isCustomCrop
      ? formData.customCrop
      : formData.cropType === "Guava" ? "珍珠芭樂" : "台梗九號米";

    try {
      let imageCids = [];

      // Upload new photo if the user picked one
      if (formData.rawFile) {
        const uploaded = await ipfs.uploadImage(formData.rawFile);
        imageCids = [uploaded.cid];
      }

      const payload = {
        batchName:    formData.batchName,
        cropType:     formData.cropType,
        cropName,
        isCustomCrop: formData.isCustomCrop,
        pesticideName:formData.pesticideName,
        imageUrl:     imageCids.length > 0
          ? `https://gateway.pinata.cloud/ipfs/${imageCids[0]}`
          : formData.imageUrl,
      };

      if (formData.id) {
        // Update existing draft
        await farmer.updateCrop(
          formData.id,
          payload,
          imageCids.length > 0 ? imageCids : undefined,
        );
        setDrafts((prev) => prev.map((d) =>
          d.id === formData.id
            ? { ...d, batch: formData.batchName, crop: cropName,
                cropValue: formData.cropType, isCustomCrop: formData.isCustomCrop,
                pesticideName: formData.pesticideName, imageUrl: payload.imageUrl }
            : d
        ));
        setModalMessage(`草稿批次 ${formData.batchName} 的內容已成功更新！`);
      } else {
        // Create new draft
        const row = await farmer.createCrop(payload, imageCids);
        const newDraft = rowToDraft(row);
        setDrafts((prev) => [newDraft, ...prev]);
        // Persist the backend-assigned UUID so subsequent saves hit PUT
        setFormData((prev) => ({ ...prev, id: row.id, imageUrl: payload.imageUrl, rawFile: null }));
        setModalMessage("全新草稿已成功儲存至左側暫存區！");
      }

      setModalType("draft_success");
    } catch (e) {
      alert("儲存失敗：" + e.message);
    }
  };

  // ── Delete draft ─────────────────────────────────────────────────
  const handleDeleteDraft = async (id, e) => {
    e.stopPropagation();
    if (!confirm("確定要刪除這筆暫存草稿嗎？")) return;
    try {
      await farmer.deleteCrop(id);
    } catch { /* ignore if already gone */ }
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  // ── Mint NFT ─────────────────────────────────────────────────────
  const handleMintNFT = async () => {
    if (!formData.batchName) { alert("請填寫批次編號才能發行鏈上 NFT！"); return; }

    setModalType("minting");

    try {
      // 1. Upload image if a new file was selected
      let imageCids = [];
      if (formData.rawFile) {
        const uploaded = await ipfs.uploadImage(formData.rawFile);
        imageCids = [uploaded.cid];
      }

      const cropName = formData.isCustomCrop
        ? formData.customCrop
        : formData.cropType === "Guava" ? "珍珠芭樂" : "台梗九號米";

      const payload = {
        batchName:    formData.batchName,
        cropType:     formData.cropType,
        cropName,
        isCustomCrop: formData.isCustomCrop,
        pesticideName:formData.pesticideName,
        imageUrl:     imageCids.length > 0
          ? `https://gateway.pinata.cloud/ipfs/${imageCids[0]}`
          : formData.imageUrl,
      };

      // 2. Ensure draft exists in DB (save or update)
      let draftId = formData.id;
      if (draftId) {
        await farmer.updateCrop(draftId, payload, imageCids.length > 0 ? imageCids : undefined);
      } else {
        const row = await farmer.createCrop(payload, imageCids);
        draftId = row.id;
        setFormData((prev) => ({ ...prev, id: draftId }));
      }

      // 3. Mint on-chain via backend
      const minted = await nft.mint({
        draftId,
        name:        `${cropName} #${formData.batchName}`,
        description: `農場產銷履歷 NFT — ${cropName}，批次 ${formData.batchName}`,
      });

      // 4. Update UI
      const newNFT = {
        id:     String(minted.tokenId),
        crop:   `${cropName} #${formData.batchName}`,
        txHash: minted.txHash,
        date:   new Date().toISOString().split("T")[0],
        status: "On-Chain",
      };
      setNfts((prev) => [newNFT, ...prev]);
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      setCurrentMintingTokenId(String(minted.tokenId));
      setModalType("success");
    } catch (e) {
      setModalType(null);
      alert("鑄造失敗：" + e.message);
    }
  };

  // ── Delete NFT ───────────────────────────────────────────────────
  const handleDeleteNFT = async (id) => {
    try {
      await nft.burn(id);
    } catch { /* ignore if burn fails — still remove from UI */ }
    setNfts((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MarketingPage />} />
        <Route path="/verify" element={<VerifyPage />} />

        <Route
          path="/farmer/login"
          element={
            <FarmerLogin
              setWalletConnected={setWalletConnected}
              setSiweAuthenticated={setSiweAuthenticated}
              onLoginSuccess={loadFarmerData}
            />
          }
        />

        <Route
          path="/farmer"
          element={
            <div className="min-h-screen bg-[#F4F9F4] flex font-sans text-gray-800 relative">
              <Sidebar
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                walletConnected={walletConnected}
                siweAuthenticated={siweAuthenticated}
                account={account}
                isDAO={isDAO}
              />

              <main className="flex-1 p-8 overflow-y-auto">
                <Header
                  walletConnected={walletConnected}
                  siweAuthenticated={siweAuthenticated}
                  onSIWELogin={() => setSiweAuthenticated(true)}
                />

                {currentPage === "dashboard" && (
                  <FarmerDashboard
                    drafts={drafts}
                    onSelectDraft={handleSelectDraft}
                    onDeleteDraft={handleDeleteDraft}
                    onAddNew={handleAddNewRecord}
                    nfts={nfts}
                    onDeleteNFT={handleDeleteNFT}
                    account={account}
                  />
                )}

                {currentPage === "records" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                    <div className="lg:col-span-2">
                      <FarmRecordForm
                        formData={formData}
                        setFormData={setFormData}
                        onSaveDraft={handleSaveDraft}
                        onMintNFT={handleMintNFT}
                        isMinting={isMinting}
                        onBack={() => setCurrentPage("dashboard")}
                      />
                    </div>
                    <div className="lg:col-span-1">
                      <DraftTable
                        drafts={drafts}
                        onSelectDraft={handleSelectDraft}
                        onDeleteDraft={handleDeleteDraft}
                        onAddNew={handleAddNewRecord}
                      />
                    </div>
                  </div>
                )}

                {currentPage === "dao" && daoSelectedProposal === null && (
                  <DAOPage
                    account={account}
                    isDAO={isDAO}
                    onOpenProposal={(proposal) => setDaoSelectedProposal(proposal)}
                  />
                )}

                {currentPage === "dao" && daoSelectedProposal !== null && (
                  <ProposalDetail
                    account={account}
                    isDAO={isDAO}
                    proposalData={daoSelectedProposal}
                    onBack={() => setDaoSelectedProposal(null)}
                  />
                )}
              </main>

              {/* ── Modals ── */}
              {modalType && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">

                  {modalType === "draft_success" && (
                    <div className="bg-white border border-[#E2EFE2] rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-xl animate-scale-up">
                      <div className="w-14 h-14 bg-[#EAF5EA] text-[#4CAF50] rounded-full flex items-center justify-center text-2xl mx-auto shadow-inner">💾</div>
                      <div>
                        <h3 className="text-lg font-black text-gray-900 tracking-wide">草稿儲存成功</h3>
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">{modalMessage}</p>
                      </div>
                      <div className="text-[10px] text-[#2E7D32] bg-[#F4F9F4] p-2.5 rounded-xl border border-[#E2EFE2] font-medium">
                        💡 提示：您隨時可以點選草稿再次編輯，或點擊「發行 NFT」正式將產銷紀錄推上區塊鏈。
                      </div>
                      <button
                        onClick={() => { setModalType(null); setCurrentPage("dashboard"); }}
                        className="w-full py-2.5 bg-[#4CAF50] hover:bg-[#43A047] text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                      >
                        我知道了，返回儀表板
                      </button>
                    </div>
                  )}

                  {modalType === "minting" && (
                    <div className="bg-white border border-[#E2EFE2] rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-xl">
                      <div className="w-16 h-16 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <h3 className="text-lg font-black text-gray-900 pt-2">後端上鏈中...</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        正在上傳 metadata 至 IPFS，並透過後端私鑰簽名鑄造 ERC-721 NFT。請勿關閉網頁。
                      </p>
                    </div>
                  )}

                  {modalType === "success" && (
                    <div className="bg-white border border-[#E2EFE2] rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-xl animate-scale-up">
                      <div className="w-16 h-16 bg-[#EAF5EA] text-[#4CAF50] rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">🎉</div>
                      <div>
                        <h3 className="text-lg font-black text-gray-950">產銷履歷 NFT 發行成功！</h3>
                        <p className="text-xs text-[#2E7D32] font-bold mt-1 bg-[#EAF5EA] inline-block px-2 py-0.5 rounded">
                          Token ID: #{currentMintingTokenId}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        數據已成功寫入以太坊虛擬機（EVM）。消費者現在已經可以透過查驗通道，輸入此 ID 即時追溯您的田間防偽履歷。
                      </p>
                      <button
                        onClick={() => { setModalType(null); setCurrentPage("dashboard"); }}
                        className="w-full py-2.5 bg-[#4CAF50] hover:bg-[#43A047] text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                      >
                        返回後台儀表板
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
