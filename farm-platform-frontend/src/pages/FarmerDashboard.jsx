import React from 'react';
import DraftTable from '../components/DraftTable';
import NFTAssetList from '../components/NFTAssetList';
import { Sprout, ShieldCheck, Database } from 'lucide-react';

export default function FarmerDashboard({ 
  drafts, 
  onSelectDraft, 
  onDeleteDraft, 
  onAddNew, 
  nfts, 
  onDeleteNFT 
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 數據看板頂部 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 玻璃半透明質感淺綠色 Banner */}
        <div className="lg:col-span-2 bg-[#EAF5EA]/70 backdrop-blur-md border border-[#C8E6C9]/40 rounded-2xl p-6 text-gray-800 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[180px]">
          <div>
            <h2 className="text-xl font-black text-[#1B5E20] tracking-wide flex items-center gap-2">
              歡迎回來，王小農！👋
            </h2>
            <p className="text-[#2E7D32] text-xs mt-2 max-w-lg leading-relaxed font-medium">
              當前區塊鏈網路連線正常，智能合約已就緒。您可以透過左下角的新增按鈕或點選既有草稿，快速發行具備密碼學存證的產銷履歷 NFT。
            </p>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2 bg-[#4CAF50]/10 border border-[#4CAF50]/20 px-3 py-1.5 rounded-xl text-xs font-bold text-[#2E7D32]">
              <Sprout size={14} /> 已上鏈作物: {nfts.length} 品項
            </div>
            <div className="flex items-center gap-2 bg-[#4CAF50]/10 border border-[#4CAF50]/20 px-3 py-1.5 rounded-xl text-xs font-bold text-[#2E7D32]">
              <ShieldCheck size={14} /> SIWE 安全驗證: 已通過
            </div>
          </div>
        </div>
        
        {/* 系統狀態小卡 */}
        <div className="bg-white border border-[#E2EFE2] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[#4CAF50] bg-[#EAF5EA] px-2.5 py-1 rounded-md">系統狀態監控</span>
            <div className="mt-4 space-y-2.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1"><Database size={12}/> 後端資料庫</span>
                <span className="text-green-600 font-semibold">PostgreSQL 連線正常</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">🌐 去中心化儲存</span>
                <span className="text-green-600 font-semibold">IPFS Node Active</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onAddNew} 
            className="w-full text-center py-2.5 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            快速建立新履歷 →
          </button>
        </div>
      </div>

      {/* 下方佈局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DraftTable 
            drafts={drafts} 
            onSelectDraft={onSelectDraft} 
            onDeleteDraft={onDeleteDraft} 
            onAddNew={onAddNew} 
          />
        </div>
        <div className="lg:col-span-2">
          <NFTAssetList nfts={nfts} onDeleteNFT={onDeleteNFT} />
        </div>
      </div>

    </div>
  );
}