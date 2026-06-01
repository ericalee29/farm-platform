import React from 'react';

export default function Header({ walletConnected, siweAuthenticated, onSIWELogin }) {
  return (
    <header className="flex justify-between items-center mb-8 border-b border-[#E2EFE2] pb-4">
      <div>
        <h1 className="text-2xl font-black text-gray-950 tracking-wide">小農產銷履歷管理後台</h1>
        <p className="text-xs text-gray-400 mt-0.5">基於 Web3 非對稱加密與去中心化儲存技術</p>
      </div>

      <div className="flex items-center gap-3">
        {walletConnected ? (
          <div className="text-xs font-bold bg-[#EAF5EA] text-[#2E7D32] border border-[#C8E6C9]/60 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            驗證成功 (SIWE)
          </div>
        ) : (
          <button 
            onClick={onSIWELogin}
            className="text-xs font-bold bg-[#4CAF50] text-white px-4 py-2 rounded-xl shadow-sm hover:bg-[#43A047] transition-all"
          >
            連接錢包驗證
          </button>
        )}
      </div>
    </header>
  );
}