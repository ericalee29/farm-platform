import React from 'react';

export default function DraftTable({ drafts, onSelectDraft, onDeleteDraft, onAddNew }) {
  return (
    <div className="bg-white border border-[#E2EFE2] rounded-3xl p-5 shadow-sm space-y-4 font-sans">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black text-gray-950 flex items-center gap-1.5">
          📄 近期的農務紀錄 - 暫存
        </h3>
        <span className="text-[10px] bg-gray-100 text-gray-400 font-bold px-1.5 py-0.5 rounded">
          {drafts.length} 筆待辦
        </span>
      </div>

      <div className="space-y-2">
        {drafts.map((d) => (
          <div 
            key={d.id}
            onClick={() => onSelectDraft(d)}
            className="p-3 border border-[#E2EFE2] hover:border-[#4CAF50] rounded-xl bg-[#F8FBF8]/60 cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden"
          >
            <div>
              <div className="text-xs font-bold text-gray-900 group-hover:text-[#2E7D32] transition-colors">{d.batch}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">作物: {d.crop}</div>
            </div>
            
            {/* 右側互動區 */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-200/40 group-hover:opacity-0 transition-opacity">
                草稿
              </span>
              
              {/* 🌟 功能 3：滑鼠游標指過去時，才會亮現的精美刪除按鈕 */}
              <button
                onClick={(e) => onDeleteDraft(d.id, e)}
                className="absolute right-3 bg-red-50 hover:bg-red-100 text-red-500 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 text-xs shadow-sm"
                title="刪除草稿"
              >
                🗑
              </button>
            </div>

          </div>
        ))}
      </div>

      <button 
        onClick={onAddNew}
        className="w-full text-center py-2 border border-dashed border-[#C8E6C9] hover:border-[#4CAF50] text-[#2E7D32] rounded-xl text-xs font-bold bg-[#F4F9F4]/30 hover:bg-[#EAF5EA]/50 transition-all"
      >
        + 新增紀錄
      </button>
    </div>
  );
}