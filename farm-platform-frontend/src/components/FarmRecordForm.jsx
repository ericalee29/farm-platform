import React, { useRef } from 'react';

export default function FarmRecordForm({ formData, setFormData, onSaveDraft, onMintNFT, isMinting, onBack }) {
  // 建立一個 useRef 來幫我們暗中點擊隱藏的檔案選取器
  const fileInputRef = useRef(null);

  // 處理作物下拉選單改變
  const handleCropChange = (e) => {
    const val = e.target.value;
    if (val === "Custom") {
      setFormData({ ...formData, cropType: "Custom", isCustomCrop: true });
    } else {
      setFormData({ ...formData, cropType: val, isCustomCrop: false, customCrop: "" });
    }
  };

  // 🌟 核心功能：處理本地照片選取與即時預覽
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. 建立本地暫時的 Blob 預覽網址（讓畫面能立刻秀出照片）
      const localPreviewUrl = URL.createObjectURL(file);
      
      // 2. 把實體檔案（file）與預覽網址（imageUrl）同時存進表單狀態中
      setFormData({ 
        ...formData, 
        rawFile: file,          // 👈 實體檔案（未來串接後端/IPFS 時傳送這個）
        imageUrl: localPreviewUrl // 👈 本地即時預覽縮圖網址
      });
    }
  };

  return (
    <div className="bg-white border border-[#E2EFE2] rounded-3xl p-6 shadow-sm space-y-6 font-sans">
      
      {/* 表單頭部 */}
      <div className="flex justify-between items-center border-b border-[#E2EFE2] pb-4">
        <div>
          <h3 className="text-lg font-black text-gray-950">生產履歷數據登錄</h3>
          <p className="text-xs text-gray-400 mt-0.5">填寫完成後可儲存草稿或直接發行 NFT</p>
        </div>
        <button onClick={onBack} className="text-xs font-bold text-[#2E7D32] hover:text-[#1B5E20] transition-colors">
          ← 返回儀表板
        </button>
      </div>

      <div className="space-y-4">
        
        {/* 1. 作物批次編號 */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">作物批次編號</label>
          <input 
            type="text" 
            placeholder="例如: 2026-05-A" 
            className="w-full px-3 py-2 border border-[#E2EFE2] rounded-xl text-sm focus:outline-none focus:border-[#4CAF50] bg-[#F8FBF8]/40"
            value={formData.batchName || ''}
            onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
          />
        </div>

        {/* 2. 作物種類（支援自行輸入新增） */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">作物種類</label>
          <select 
            className="w-full px-3 py-2 border border-[#E2EFE2] rounded-xl text-sm focus:outline-none focus:border-[#4CAF50] bg-[#F8FBF8]/40 mb-2"
            value={formData.isCustomCrop ? "Custom" : (formData.cropType || 'Guava')}
            onChange={handleCropChange}
          >
            <option value="Guava">珍珠芭樂</option>
            <option value="Rice">台梗九號米</option>
            <option value="Custom">✨ 其他（自行輸入新增）</option>
          </select>

          {formData.isCustomCrop && (
            <input 
              type="text" 
              placeholder="請輸入您要新增的作物名稱（例如：大湖有機草莓）" 
              className="w-full px-3 py-2 border border-[#4CAF50] bg-white rounded-xl text-sm focus:outline-none animate-fade-in"
              value={formData.customCrop || ''}
              onChange={(e) => setFormData({ ...formData, customCrop: e.target.value })}
            />
          )}
        </div>

        {/* 3. 資材/肥料/防護劑名稱 */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">資材/肥料/防護劑名稱</label>
          <input 
            type="text" 
            placeholder="例如: 苦楝油、無患子液" 
            className="w-full px-3 py-2 border border-[#E2EFE2] rounded-xl text-sm focus:outline-none focus:border-[#4CAF50] bg-[#F8FBF8]/40"
            value={formData.pesticideName || ''}
            onChange={(e) => setFormData({ ...formData, pesticideName: e.target.value })}
          />
        </div>

        {/* 4. 🌟 終極修改：真正觸發本地照片選取 */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">田間實況照片上傳</label>
          
          {/* 隱藏的實體 HTML 檔案上傳鈕，限制只能選圖片 */}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden" 
          />

          {/* 美化過後的虛擬大卡片點擊區 */}
          <div 
            onClick={() => fileInputRef.current.click()} // 👈 點擊卡片時，暗中觸發選取檔案
            className="border-2 border-dashed border-[#C8E6C9] hover:border-[#4CAF50] bg-[#F8FBF8]/60 hover:bg-[#EAF5EA]/30 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
          >
            {formData.imageUrl ? (
              <div className="space-y-2">
                <img 
                  src={formData.imageUrl} 
                  alt="田間實況預覽" 
                  className="max-h-40 mx-auto rounded-xl object-cover shadow-sm animate-fade-in"
                />
                <p className="text-[11px] text-[#2E7D32] font-bold">✓ 本地照片已載入，點擊可重新更換</p>
                {formData.rawFile && (
                  <p className="text-[9px] text-gray-400 font-mono">檔案名稱: {formData.rawFile.name}</p>
                )}
              </div>
            ) : (
              <>
                <div className="text-2xl group-hover:scale-110 transition-transform">📁</div>
                <div className="text-xs font-bold text-gray-500 group-hover:text-gray-700">點擊選取本地田間照片</div>
                <div className="text-[10px] text-gray-400">支援 JPG, PNG 格式 (將自動儲存至 IPFS 去中心化網絡)</div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* 按鈕功能區 */}
      <div className="flex gap-3 pt-2 border-t border-[#E2EFE2]">
        <button 
          onClick={onSaveDraft} 
          className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
        >
          儲存為暫存草稿
        </button>
        <button 
          onClick={onMintNFT} 
          className="flex-1 py-2.5 bg-[#4CAF50] hover:bg-[#43A047] text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
        >
          發行履歷 NFT (上鏈)
        </button>
      </div>

    </div>
  );
}