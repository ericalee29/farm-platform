import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, ArrowLeft } from "lucide-react";
import { BrowserProvider } from "ethers";
import { Buffer } from "buffer";
import { SiweMessage } from "siwe";
import { auth, token } from "../utils/api";

// Make Buffer available globally for siwe v2 / @spruceid/siwe-parser
if (typeof globalThis.Buffer === "undefined") {
  globalThis.Buffer = Buffer;
}

export default function FarmerLogin({ setWalletConnected, setSiweAuthenticated, onLoginSuccess }) {
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState("");
  const [step,    setStep]      = useState("idle");

  const STEP_LABEL = {
    idle:       "同意協議並簽名登入",
    connecting: "連接錢包中...",
    signing:    "MetaMask 簽名中...",
    verifying:  "驗證身份中...",
  };

  async function handleLogin() {
    if (!window.ethereum) {
      setError("請先安裝 MetaMask 或其他 Web3 錢包");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Connect wallet
      setStep("connecting");
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer  = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      // 2. Get nonce from backend
      const { nonce } = await auth.nonce(address);

      // 3. Build SIWE message
      const message = new SiweMessage({
        domain:    window.location.host,
        address,
        statement: "Sign in to Little Farmer DAO Farmer Portal",
        uri:       window.location.origin,
        version:   "1",
        chainId:   Number(network.chainId),
        nonce,
      });
      const preparedMsg = message.prepareMessage();

      // 4. Sign
      setStep("signing");
      const signature = await signer.signMessage(preparedMsg);

      // 5. Verify with backend — receive JWT
      setStep("verifying");
      const result = await auth.verify(preparedMsg, signature);

      // 6. Persist token, update parent state
      token.set(result.token);
      setWalletConnected(true);
      setSiweAuthenticated(true);
      await onLoginSuccess?.();
      navigate("/farmer");
    } catch (e) {
      if (e.code === 4001) {
        setError("您取消了簽名請求。");
      } else {
        setError(e.message || "登入失敗，請重試。");
      }
    } finally {
      setLoading(false);
      setStep("idle");
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F9F4] flex flex-col items-center justify-center p-4 relative font-sans">
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] hover:text-[#1B5E20] transition-colors"
      >
        <ArrowLeft size={14} /> 返回消費者大廳
      </button>

      <div className="bg-white border border-[#E2EFE2] rounded-3xl p-8 max-w-sm w-full shadow-sm text-center space-y-6">
        <div className="w-14 h-14 bg-[#EAF5EA] text-[#4CAF50] rounded-full flex items-center justify-center text-2xl mx-auto shadow-inner">
          🧑‍🌾
        </div>
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

        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-[#4CAF50] hover:bg-[#43A047] text-white font-bold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {STEP_LABEL[step]}
        </button>
      </div>
    </div>
  );
}
