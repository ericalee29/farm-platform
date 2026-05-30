import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useState } from "react";

import MarketingPage from "./pages/MarketingPage";
import VerifyPage    from "./pages/VerifyPage";

import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerLogin from "./pages/FarmerLogin";
import Sidebar from "./components/Sidebar";
import FarmRecordForm from "./components/FarmRecordForm";
import DraftTable from "./components/DraftTable";
import Header from "./components/Header";

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard'); 
  const [walletConnected, setWalletConnected] = useState(false);
  const [siweAuthenticated, setSiweAuthenticated] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  // 🌟 擴充控制彈窗狀態：null, 'draft_success', 'minting', 'success'
  const [modalType, setModalType] = useState(null); 
  const [currentMintingTokenId, setCurrentMintingTokenId] = useState('');
  const [modalMessage, setModalMessage] = useState(''); // 儲存草稿時的提示文字

  // 草稿暫存區數據流
  const [drafts, setDrafts] = useState([
    { id: '1', batch: '2026-05-A', crop: '珍珠芭樂', cropValue: 'Guava', isCustomCrop: false, pesticideName: '苦楝油', imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef' },
    { id: '2', batch: '2026-06-B', crop: '台梗九號米', cropValue: 'Rice', isCustomCrop: false, pesticideName: '無患子液', imageUrl: '' }
  ]);

  // 已發行 NFT 資產庫數據流
  const [nfts, setNfts] = useState([
    { id: '72101', crop: '珍珠芭樂 #2026-05-A', txHash: '0x123a...456b', date: '2026-05-28', status: 'On-Chain' }
  ]);

  // 目前表單正在輸入的暫存橋樑
  const [formData, setFormData] = useState({ id: '', batchName: '', cropType: 'Guava', customCrop: '', isCustomCrop: false, pesticideName: '', imageUrl: '', rawFile: null });

  const handleAddNewRecord = () => { 
    setFormData({ id: '', batchName: '', cropType: 'Guava', customCrop: '', isCustomCrop: false, pesticideName: '', imageUrl: '', rawFile: null }); 
    setCurrentPage('records'); 
  };
  
  const handleSelectDraft = (draft) => { 
    setFormData({ 
      id: draft.id,
      batchName: draft.batch, 
      cropType: draft.cropValue, 
      isCustomCrop: draft.isCustomCrop || false,
      customCrop: draft.isCustomCrop ? draft.crop : '', 
      pesticideName: draft.pesticideName, 
      imageUrl: draft.imageUrl || '',
      rawFile: null
    }); 
    setCurrentPage('records'); 
  };

  // 🌟 功能優化：處理草稿儲存，改用精美內建彈窗
  const handleSaveDraft = () => {
    if (!formData.batchName) { alert('請輸入批次編號！'); return; }
    
    const cropName = formData.isCustomCrop ? formData.customCrop : (formData.cropType === 'Guava' ? '珍珠芭樂' : '台梗九號米');
    
    if (formData.id) {
      // 編輯既有草稿 ➡️ 覆蓋
      setDrafts(drafts.map(d => d.id === formData.id ? {
        ...d, batch: formData.batchName, crop: cropName, cropValue: formData.cropType, isCustomCrop: formData.isCustomCrop, pesticideName: formData.pesticideName, imageUrl: formData.imageUrl
      } : d));
      setModalMessage(`草稿批次 ${formData.batchName} 的內容已成功更新！`);
    } else {
      // 全新草稿 ➡️ 新增
      const newDraft = {
        id: String(Date.now()), batch: formData.batchName, crop: cropName, cropValue: formData.cropType, isCustomCrop: formData.isCustomCrop, pesticideName: formData.pesticideName, imageUrl: formData.imageUrl
      };
      setDrafts([newDraft, ...drafts]);
      setModalMessage(`全新草稿已成功儲存至左側暫存區！`);
    }
    
    // 💥 關鍵點：啟動儲存成功彈窗！
    setModalType('draft_success');
  };

  // 處理草稿刪除
  const handleDeleteDraft = (id, e) => {
    e.stopPropagation(); 
    if (confirm('確定要刪除這筆暫存草稿嗎？')) {
      setDrafts(drafts.filter(d => d.id !== id));
    }
  };

  // 處理發行 NFT
  const handleMintNFT = () => {
    if (!formData.batchName) { alert('請填寫批次編號才能發行鏈上 NFT！'); return; }
    
    const nextTokenId = String(72101 + nfts.length);
    setCurrentMintingTokenId(nextTokenId);
    setModalType('minting');
    
    setTimeout(() => {
      const cropName = formData.isCustomCrop ? formData.customCrop : (formData.cropType === 'Guava' ? '珍珠芭樂' : '台梗九號米');
      const newNFT = {
        id: nextTokenId,
        crop: `${cropName} #${formData.batchName}`,
        txHash: '0x' + Math.random().toString(16).substr(2, 8) + '...' + Math.random().toString(16).substr(2, 4),
        date: new Date().toISOString().split('T')[0],
        status: 'On-Chain'
      };
      
      setNfts([newNFT, ...nfts]);
      if (formData.id) { setDrafts(drafts.filter(d => d.id !== formData.id)); }
      setModalType('success');
    }, 1800);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MarketingPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/farmer/login" element={<FarmerLogin setWalletConnected={setWalletConnected} setSiweAuthenticated={setSiweAuthenticated} />} />

        <Route 
          path="/farmer" 
          element={
            <div className="min-h-screen bg-[#F4F9F4] flex font-sans text-gray-800 relative">
              <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} walletConnected={walletConnected} siweAuthenticated={siweAuthenticated} />
              
              <main className="flex-1 p-8 overflow-y-auto">
                <Header walletConnected={walletConnected} siweAuthenticated={siweAuthenticated} onSIWELogin={() => setSiweAuthenticated(true)} />
                
                {currentPage === 'dashboard' && (
                  <FarmerDashboard drafts={drafts} onSelectDraft={handleSelectDraft} onDeleteDraft={handleDeleteDraft} onAddNew={handleAddNewRecord} nfts={nfts} onDeleteNFT={(id) => setNfts(nfts.filter(n => n.id !== id))} />
                )}

                {currentPage === 'records' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                    <div className="lg:col-span-2">
                      <FarmRecordForm formData={formData} setFormData={setFormData} onSaveDraft={handleSaveDraft} onMintNFT={handleMintNFT} isMinting={isMinting} onBack={() => setCurrentPage('dashboard')} />
                    </div>
                    <div className="lg:col-span-1">
                      <DraftTable drafts={drafts} onSelectDraft={handleSelectDraft} onDeleteDraft={handleDeleteDraft} onAddNew={handleAddNewRecord} />
                    </div>
                  </div>
                )}
              </main>

              {/* 🌟 統一彈窗大本營 (含磨砂玻璃效果) */}
              {modalType && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                  
                  {/* 🟢 新增狀態：儲存草稿成功彈窗 */}
                  {modalType === 'draft_success' && (
                    <div className="bg-white border border-[#E2EFE2] rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-xl animate-scale-up">
                      <div className="w-14 h-14 bg-[#EAF5EA] text-[#4CAF50] rounded-full flex items-center justify-center text-2xl mx-auto shadow-inner">💾</div>
                      <div>
                        <h3 className="text-lg font-black text-gray-900 tracking-wide">草稿儲存成功</h3>
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                          {modalMessage}
                        </p>
                      </div>
                      <div className="text-[10px] text-[#2E7D32] bg-[#F4F9F4] p-2.5 rounded-xl border border-[#E2EFE2] font-medium">
                        💡 提示：您隨時可以點選草稿再次編輯，或點擊「發行 NFT」正式將產銷紀錄推上區塊鏈。
                      </div>
                      <button 
                        onClick={() => { setModalType(null); setCurrentPage('dashboard'); }}
                        className="w-full py-2.5 bg-[#4CAF50] hover:bg-[#43A047] text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                      >
                        我知道了，返回儀表板
                      </button>
                    </div>
                  )}

                  {/* 狀態 B：區塊鏈節點打包簽名中 */}
                  {modalType === 'minting' && (
                    <div className="bg-white border border-[#E2EFE2] rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-xl">
                      <div className="w-16 h-16 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <h3 className="text-lg font-black text-gray-900 pt-2">Metamask 錢包簽名中...</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">正在召喚 Sepolia 智慧合約，將田間實況照片上傳至 IPFS，並鑄造 ERC-721 密碼學產銷憑證。請勿關閉網頁。</p>
                    </div>
                  )}

                  {/* 狀態 C：鑄造成功大捷報 */}
                  {modalType === 'success' && (
                    <div className="bg-white border border-[#E2EFE2] rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-xl animate-scale-up">
                      <div className="w-16 h-16 bg-[#EAF5EA] text-[#4CAF50] rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">🎉</div>
                      <div>
                        <h3 className="text-lg font-black text-gray-950">產銷履歷 NFT 發行成功！</h3>
                        <p className="text-xs text-[#2E7D32] font-bold mt-1 bg-[#EAF5EA] inline-block px-2 py-0.5 rounded">Token ID: #{currentMintingTokenId}</p>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        數據已成功寫入以太坊虛擬機（EVM）。消費者現在已經可以透過大廳、查驗通道，輸入此 ID 即時追溯您的田間防偽履歷。
                      </p>
                      <button 
                        onClick={() => { setModalType(null); setCurrentPage('dashboard'); }}
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