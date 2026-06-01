import { useState } from 'react'
import { getWriteContract } from '../utils/contract'

// Proposal subtypes per category
const DISPUTE_TYPES = [
  { value: 'burn',     label: '銷毀詐欺 NFT（proposeBurnToken）' },
  { value: 'metadata', label: '更正 NFT Metadata（proposeMetadataCorrection）' },
]

const RULE_TYPES = [
  { value: 'quorum',  label: '修改投票門檻（Quorum）' },
  { value: 'period',  label: '修改投票期限（Voting Period）' },
]

export default function CreateProposalModal({ account, onClose, onSuccess }) {
  const [category,    setCategory]    = useState('dispute') // 'dispute' | 'rule'
  const [disputeType, setDisputeType] = useState('burn')
  const [ruleType,    setRuleType]    = useState('quorum')
  const [tokenId,     setTokenId]     = useState('')
  const [newMetaUri,  setNewMetaUri]  = useState('')
  const [evidence,    setEvidence]    = useState('')
  const [newValue,    setNewValue]    = useState('')
  const [txPending,   setTxPending]   = useState(false)
  const [txMsg,       setTxMsg]       = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!account) return alert('請先連接錢包')
    setTxPending(true)
    setTxMsg('')

    try {
      const contract = await getWriteContract()
      let tx

      if (category === 'dispute') {
        if (disputeType === 'burn') {
          if (!tokenId) throw new Error('請輸入 Token ID')
          tx = await contract.proposeBurnToken(tokenId, evidence)
        } else {
          if (!tokenId || !newMetaUri) throw new Error('請填寫 Token ID 與新 Metadata URI')
          tx = await contract.proposeMetadataCorrection(tokenId, newMetaUri, evidence)
        }
      } else {
        const val = Number(newValue)
        if (!val || val <= 0) throw new Error('請輸入有效數值')
        if (ruleType === 'quorum') {
          tx = await contract.proposeQuorum(val, evidence)
        } else {
          tx = await contract.proposeVotingPeriod(val, evidence)
        }
      }

      setTxMsg('交易送出，等待確認...')
      await tx.wait()
      setTxMsg('提案建立成功！')
      onSuccess?.()
      setTimeout(onClose, 1500)
    } catch (err) {
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        setTxMsg('')
      } else if (!getWriteContract) {
        // contract not deployed — show mock success
        setTxMsg('（模擬）提案已建立，合約未部署僅供展示。')
        setTimeout(onClose, 1500)
      } else {
        setTxMsg('失敗：' + (err.shortMessage || err.message))
      }
    } finally {
      setTxPending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-gray-800">新增提案</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">提案類型</label>
            <div className="flex gap-2">
              {[
                { value: 'dispute', label: '事件 / 爭議' },
                { value: 'rule',    label: '規定修改' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCategory(opt.value)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    category === opt.value
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Dispute fields ── */}
          {category === 'dispute' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">操作類型</label>
                <select
                  value={disputeType}
                  onChange={(e) => setDisputeType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-green-400"
                >
                  {DISPUTE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Token ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  placeholder="例如：42"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-green-400"
                  required
                />
              </div>

              {disputeType === 'metadata' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    新 Metadata URI <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMetaUri}
                    onChange={(e) => setNewMetaUri(e.target.value)}
                    placeholder="ipfs://..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-green-400"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">說明 / 證據</label>
                <textarea
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  placeholder="描述爭議原因或附上證據連結..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-green-400 resize-none"
                />
              </div>
            </>
          )}

          {/* ── Rule change fields ── */}
          {category === 'rule' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">修改項目</label>
                <select
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-green-400"
                >
                  {RULE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  {ruleType === 'quorum' ? '新門檻（票數）' : '新投票期限（秒）'}
                  <span className="text-red-400"> *</span>
                  {ruleType === 'period' && (
                    <span className="text-gray-400 font-normal ml-1">（1 天 = 86400 秒）</span>
                  )}
                </label>
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={ruleType === 'quorum' ? '例如：3' : '例如：259200'}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-green-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">修改說明</label>
                <textarea
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  placeholder="說明為何需要修改此規定..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-green-400 resize-none"
                />
              </div>
            </>
          )}

          {txMsg && (
            <p className={`text-xs ${txMsg.startsWith('失敗') ? 'text-red-500' : 'text-green-600'}`}>
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
              disabled={txPending}
              className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {txPending ? '送出中...' : '送出提案'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
