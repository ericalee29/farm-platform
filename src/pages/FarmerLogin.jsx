import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, ArrowLeft } from "lucide-react";

export default function FarmerLogin({ setWalletConnected, setSiweAuthenticated }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleFakeLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setWalletConnected(true);
      setSiweAuthenticated(true);
      setLoading(false);
      navigate("/farmer");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F4F9F4] flex flex-col items-center justify-center p-4 relative font-sans">
      <button 
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] hover:text-[#1B5E20] transition-colors"
      >
        <ArrowLeft size={14} /> 返回消費者大廳
      </button>

      <div className="bg-white border border-[#E2EFE2] rounded-3xl p-8 max-w-sm w-full shadow-sm text-center space-y-6">
        <div className="w-14 h-14 bg-[#EAF5EA] text-[#4CAF50] rounded-full flex items-center justify-center text-2xl mx-auto shadow-inner">🧑‍🌾</div>
        <div>
          <h2 className="text-xl font-black text-gray-950 tracking-wide">小農履歷系統後台</h2>
          <p className="text-xs text-gray-400 mt-1">請透過 Web3 錢包簽名完成身分驗證</p>
        </div>
        <div className="bg-[#F8FBF8] border border-[#E2EFE2] rounded-xl p-3.5 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
            <ShieldCheck size={14} className="text-[#4CAF50]" />
            <span>網路環境: Sepolia Testnet</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
            <Lock size={14} className="text-[#4CAF50]" />
            <span>安全加密: SIWE (EIP-4361)</span>
          </div>
        </div>
        <button
          onClick={handleFakeLogin}
          disabled={loading}
          className="w-full py-3 bg-[#4CAF50] hover:bg-[#43A047] text-white font-bold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? "驗證中..." : "同意協議並簽名登入"}
        </button>
      </div>
    </div>
  );
}