import React, { useState } from 'react';
import { Layers, FileText, ShieldCheck } from 'lucide-react';
import Icon from './CropTrustIcons';
import { dao } from '../utils/api';

export default function Sidebar({ currentPage, setCurrentPage, walletConnected, siweAuthenticated, account, isDAO }) {
  const [joining, setJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState('');

  async function handleDevJoinDAO() {
    if (!account) { setJoinMsg('請先連接錢包'); return; }
    setJoining(true);
    setJoinMsg('');
    try {
      // 後端用 deployer key 幫用戶呼叫 addMember()，任何人都能用
      await dao.devAddMember(account);
      setJoinMsg('✓ 已加入 DAO，請重新整理頁面');
    } catch (e) {
      setJoinMsg('失敗：' + (e.shortMessage || e.message));
    } finally {
      setJoining(false);
    }
  }
  return (
    <aside className="w-64 bg-white border-r border-[#E2EFE2] min-h-screen flex flex-col justify-between p-4 flex-shrink-0 font-sans">
      
      {/* 上半部：Logo 與 功能選單 */}
      <div className="space-y-6">
        
        {/* 漂亮的 Logo 區塊結構 */}
        <a href="/" className="p-2 border-b border-[#E2EFE2] flex items-center gap-3 pb-5 no-underline hover:opacity-80 transition-opacity" style={{ textDecoration: 'none' }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
            style={{ backgroundColor: '#EAF5EA', color: '#4CAF50' }}
          >
            <Icon name="leaf" size={22} />
          </div>
          <div>
            <div className="text-sm font-black text-gray-900 tracking-wider">
              Crop<span className="text-[#4CAF50]">Chain</span>
            </div>
            <div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">
              Farmer Portal
            </div>
          </div>
        </a>
        
        {/* 連動狀態的導航選單按鈕 */}
        <nav className="space-y-2">
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm ${
              currentPage === 'dashboard' 
                ? 'bg-[#EAF5EA] text-[#2E7D32]' 
                : 'text-gray-500 hover:bg-[#F4F9F4] hover:text-gray-900'
            }`}
          >
            <Layers size={18} /> 首頁儀表板
          </button>

          <button 
            onClick={() => setCurrentPage('records')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm ${
              currentPage === 'records' 
                ? 'bg-[#EAF5EA] text-[#2E7D32]' 
                : 'text-gray-500 hover:bg-[#F4F9F4] hover:text-gray-900'
            }`}
          >
            <FileText size={18} /> 農務紀錄
          </button>

          <button 
            onClick={() => setCurrentPage('dao')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm ${
              currentPage === 'dao' 
                ? 'bg-[#EAF5EA] text-[#2E7D32]' 
                : 'text-gray-500 hover:bg-[#F4F9F4] hover:text-gray-900'
            }`}
          >
            <ShieldCheck size={18} /> DAO 治理
          </button>
        </nav>
      </div>
      
      {/* 下半部：錢包連接與安全狀態 */}
      <div className="bg-[#F8FBF8] border border-[#E2EFE2] rounded-xl p-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 font-medium">
          <div className={`w-2 h-2 rounded-full ${walletConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          {walletConnected ? 'Connected: 0xAbC...deF' : '錢包未連線'}
        </div>
        {siweAuthenticated && (
          <div className="space-y-2">
            <div className="flex gap-1.5">
              <div className="text-[11px] bg-[#EAF5EA] text-[#2E7D32] inline-flex items-center px-2 py-1 rounded-md font-bold shadow-sm">
                ✓ SIWE 驗證
              </div>
              <div className={`text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-md font-bold ${
                isDAO ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isDAO ? 'bg-blue-500' : 'bg-gray-300'}`} />
                {isDAO ? 'DAO 成員' : '非成員'}
              </div>
            </div>
            <button
              onClick={handleDevJoinDAO}
              disabled={joining || isDAO}
              title={isDAO ? '您已經是 DAO 成員' : ''}
              className={`w-full text-[11px] font-bold px-2 py-1.5 rounded-md border transition-colors ${
                isDAO
                  ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 disabled:opacity-50'
              }`}
            >
              {joining ? '加入中...' : '⚡ 快速加入 DAO'}
            </button>
            {joinMsg && (
              <p className={`text-[10px] font-medium ${joinMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
                {joinMsg}
              </p>
            )}
          </div>
        )}
      </div>

    </aside>
  );
}