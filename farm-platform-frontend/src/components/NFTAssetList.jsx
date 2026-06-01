import React from 'react';

export default function NFTAssetList({ nfts, onDeleteNFT }) {
  return (
    <div className="bg-white border border-[#E2EFE2] rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-[#E2EFE2] pb-3">
        <div>
          <h3 className="text-sm font-black text-gray-950 flex items-center gap-1.5">
            📦 已發行溯源 NFT 資產庫 (ERC-721)
          </h3>
        </div>
        <div className="text-[11px] text-gray-400 font-bold">
          Total Synced: {nfts.length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2EFE2] text-[11px] font-bold text-gray-400 tracking-wider">
              <th className="pb-3 font-bold">Token ID</th>
              <th className="pb-3 font-bold">區塊鏈批次內容</th>
              <th className="pb-3 font-bold">發行日期</th>
              <th className="pb-3 font-bold">交易雜湊 (Tx Hash)</th>
              <th className="pb-3 font-bold">鏈上狀態</th>
              <th className="pb-3 font-bold text-right">管理操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F9F4]">
            {nfts.map((n) => (
              <tr key={n.id} className="text-xs text-gray-700 hover:bg-[#F8FBF8]/40 transition-colors group">
                <td className="py-3.5 font-bold text-[#4CAF50]">#{n.id}</td>
                <td className="py-3.5 font-medium text-gray-900">{n.crop}</td>
                <td className="py-3.5 text-gray-400">{n.date}</td>
                <td className="py-3.5 font-mono text-gray-400 hover:text-[#4CAF50] transition-colors cursor-pointer">
                  {n.txHash} ↗
                </td>
                <td className="py-3.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5EA] text-[#2E7D32] border border-[#C8E6C9]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    已上鏈存證
                  </span>
                </td>
                <td className="py-3.5 text-right space-x-2">
                  <button 
                    onClick={() => alert(`正在列印 Token #${n.id} 的實體防偽 QR Code 標籤`)}
                    className="text-[11px] font-bold text-[#2E7D32] border border-[#C8E6C9] px-2 py-1 rounded-lg bg-[#EAF5EA]/50 hover:bg-[#EAF5EA] transition-all"
                  >
                    㗊 標籤 QR
                  </button>
                  <button 
                    onClick={() => onDeleteNFT(n.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors text-sm opacity-0 group-hover:opacity-100 pl-1"
                    title="刪除資產紀錄"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {nfts.length === 0 && (
        <div className="text-center py-8 text-xs text-gray-400 font-medium">
          目前尚無已發行的 NFT 資產，請在左側草稿或填寫表單發行第一筆資料。
        </div>
      )}
    </div>
  );
}