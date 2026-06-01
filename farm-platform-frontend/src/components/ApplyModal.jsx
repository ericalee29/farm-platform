import { useState } from 'react'
import { getWriteContract } from '../utils/contract'

export default function ApplyModal({ account, onClose, onSuccess }) {
  const [description, setDescription] = useState('')
  const [txPending, setTxPending] = useState(false)
  const [txMsg, setTxMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!account) return alert('請先連接錢包')
    if (!description.trim()) return

    setTxPending(true)
    setTxMsg('')
    try {
      const contract = await getWriteContract()
      const tx = await contract.propose(account, description.trim())
      setTxMsg('交易送出，等待確認...')
      await tx.wait()
      setTxMsg('申請送出成功！')
      onSuccess?.()
      setTimeout(onClose, 1500)
    } catch (e) {
      setTxMsg(`錯誤：${e.reason ?? e.message}`)
    } finally {
      setTxPending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-gray-800">申請加入 DAO</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">申請人地址</label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg text-xs font-mono text-gray-500 break-all">
              {account ?? '尚未連接錢包'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              申請說明 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="請描述您的農場背景或加入原因..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-green-400 resize-none"
              required
            />
          </div>

          {txMsg && (
            <p className={`text-xs ${txMsg.startsWith('錯誤') ? 'text-red-500' : 'text-green-600'}`}>
              {txMsg}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-500 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={txPending || !description.trim()}
              className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {txPending ? '送出中...' : '送出申請'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
