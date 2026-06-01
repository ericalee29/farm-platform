import { useEffect, useState } from 'react'
import { ArrowLeft, Check, X } from 'lucide-react'
import { getReadContract, getWriteContract, STATUS_LABEL, STATUS_COLOR } from '../utils/contract'
import { shortenAddress } from '../utils/wallet'

const MOCK_PROPOSALS = {
  '1': {
    proposalId: 1n,
    applicantAddress: '0xAbCd1234567890abcdef1234567890abcdef1234',
    proposerAddress: '0x1111111111111111111111111111111111111111',
    yesVotes: 5n,
    noVotes: 1n,
    deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 2),
    executed: false,
    status: 1,
    description: '白名單申請：農民 0xAbCd...1234 申請加入聯盟',
  },
  '2': {
    proposalId: 2n,
    applicantAddress: '0x0000000000000000000000000000000000000000',
    proposerAddress: '0x2222222222222222222222222222222222222222',
    yesVotes: 8n,
    noVotes: 2n,
    deadline: BigInt(Math.floor(Date.now() / 1000) - 3600),
    executed: false,
    status: 2,
    description: '事件/爭議：第三批次有機肥料爭議處理方案',
  },
  '3': {
    proposalId: 3n,
    applicantAddress: '0x0000000000000000000000000000000000000000',
    proposerAddress: '0x3333333333333333333333333333333333333333',
    yesVotes: 3n,
    noVotes: 0n,
    deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 5),
    executed: false,
    status: 1,
    description: '規定修改：調整投票門檻從 60% 降至 55%',
  },
  '4': {
    proposalId: 4n,
    applicantAddress: '0xDeaD5678901234deadbeef5678901234deadbeef',
    proposerAddress: '0x4444444444444444444444444444444444444444',
    yesVotes: 2n,
    noVotes: 7n,
    deadline: BigInt(Math.floor(Date.now() / 1000) - 7200),
    executed: false,
    status: 3,
    description: '白名單申請：農民 0xDeaD...beef 申請加入聯盟',
  },
}

function timeLeft(deadline) {
  const now = Math.floor(Date.now() / 1000)
  const diff = Number(deadline) - now
  if (diff <= 0) return '已截止'
  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  if (days > 0) return `剩 ${days} 天 ${hours} 小時`
  return `剩 ${hours} 小時`
}

function formatDeadline(deadline) {
  return new Date(Number(deadline) * 1000).toLocaleString('zh-TW')
}

// Props: account, isDAO, proposalId, onBack
export default function ProposalDetail({ account, isDAO, proposalId, onBack }) {
  const id = String(proposalId)
  const [proposal, setProposal] = useState(MOCK_PROPOSALS[id] ?? null)
  const [voted, setVoted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [txPending, setTxPending] = useState(false)
  const [txMsg, setTxMsg] = useState('')

  useEffect(() => {
    if (account) loadDetail()
  }, [proposalId, account])

  async function loadDetail() {
    try {
      setLoading(true)
      const contract = await getReadContract()
      const [raw, hasVoted] = await Promise.all([
        contract.getProposal(proposalId),
        account ? contract.hasVoted(proposalId, account) : Promise.resolve(false),
      ])
      setProposal(raw)
      setVoted(hasVoted)
    } catch {
      // keep mock
      if (account) setVoted(false)
    } finally {
      setLoading(false)
    }
  }

  async function handleVote(support) {
    if (!account) return alert('請先連接錢包')
    setTxPending(true)
    setTxMsg('')
    try {
      const contract = await getWriteContract()
      const tx = await contract.vote(proposalId, support)
      setTxMsg('交易送出，等待確認...')
      await tx.wait()
      setVoted(true)
      setTxMsg('投票成功！')
      loadDetail()
    } catch (e) {
      const isUserRejected =
        e.code === 4001 ||
        e.code === 'ACTION_REJECTED' ||
        e.message?.includes('user rejected') ||
        e.message?.includes('User denied')

      if (isUserRejected) {
        // 使用者取消 → 什麼都不做，清掉 pending 狀態
        setTxMsg('')
      } else {
        // 合約未部署或其他鏈上錯誤 → 模擬投票並標示清楚
        setProposal((prev) => ({
          ...prev,
          yesVotes: support ? prev.yesVotes + 1n : prev.yesVotes,
          noVotes: !support ? prev.noVotes + 1n : prev.noVotes,
        }))
        setVoted(true)
        setTxMsg('（模擬）投票成功！合約尚未部署，此結果僅供展示。')
      }
    } finally {
      setTxPending(false)
    }
  }

  async function handleExecute() {
    setTxPending(true)
    setTxMsg('')
    try {
      const contract = await getWriteContract()
      const tx = await contract.execute(proposalId)
      setTxMsg('交易送出，等待確認...')
      await tx.wait()
      setTxMsg('執行成功！')
      loadDetail()
    } catch (e) {
      const isUserRejected =
        e.code === 4001 ||
        e.code === 'ACTION_REJECTED' ||
        e.message?.includes('user rejected') ||
        e.message?.includes('User denied')

      if (isUserRejected) {
        setTxMsg('')
      } else {
        setProposal((prev) => ({ ...prev, status: 4, executed: true }))
        setTxMsg('（模擬）執行成功！合約尚未部署，此結果僅供展示。')
      }
    } finally {
      setTxPending(false)
    }
  }

  if (loading) return <div className="p-6 text-center text-gray-400">載入中...</div>
  if (!proposal) return <div className="p-6 text-center text-gray-400">找不到提案</div>

  const total = Number(proposal.yesVotes) + Number(proposal.noVotes)
  const yesPercent = total > 0 ? Math.round((Number(proposal.yesVotes) / total) * 100) : 0
  const isActive = proposal.status === 1
  const isPassed = proposal.status === 2
  const isExecuted = proposal.status === 4

  return (
    <div className="p-6 max-w-2xl">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-green-600 mb-5 transition-colors"
      >
        <ArrowLeft size={15} /> 返回列表
      </button>

      {/* Main card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-base font-semibold text-gray-800 leading-relaxed flex-1">
            {proposal.description}
          </h2>
          <span
            className={`shrink-0 flex items-center justify-center text-xs font-medium tracking-wide ${STATUS_COLOR[proposal.status]}`}
            style={{
              width: '64px',
              paddingTop: '4px',
              paddingBottom: '14px',
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 70%, 0 100%)',
              alignSelf: 'flex-start',
            }}
          >
            {STATUS_LABEL[proposal.status]}
          </span>
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-6">
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">提案人</p>
            <p className="text-gray-700 font-mono text-xs">{shortenAddress(proposal.proposerAddress)}</p>
          </div>
          {proposal.applicantAddress !== '0x0000000000000000000000000000000000000000' && (
            <div className="bg-gray-50 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-400 mb-0.5">申請人</p>
              <p className="text-gray-700 font-mono text-xs">{shortenAddress(proposal.applicantAddress)}</p>
            </div>
          )}
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">截止時間</p>
            <p className="text-gray-700 text-xs">{formatDeadline(proposal.deadline)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">剩餘時間</p>
            <p className="text-gray-700 text-xs">{timeLeft(proposal.deadline)}</p>
          </div>
        </div>

        {/* Vote result */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-medium mb-2">
            <span className="flex items-center gap-1 text-green-600"><Check size={12} />贊成 {proposal.yesVotes.toString()} 票 ({yesPercent}%)</span>
            <span className="flex items-center gap-1 text-red-400"><X size={12} />反對 {proposal.noVotes.toString()} 票 ({100 - yesPercent}%)</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all duration-500"
              style={{ width: `${yesPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">總票數：{total}</p>
        </div>

        {/* Vote actions */}
        {isActive && (
          <div className="border-t border-gray-50 pt-5">
            {voted ? (
              <p className="text-center text-sm text-gray-400">您已對此提案投票</p>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => handleVote(true)}
                  disabled={txPending}
                  className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  贊成
                </button>
                <button
                  onClick={() => handleVote(false)}
                  disabled={txPending}
                  className="flex-1 py-2.5 bg-white hover:bg-red-50 disabled:opacity-50 text-red-500 text-sm font-medium rounded-lg border border-red-200 transition-colors"
                >
                  反對
                </button>
              </div>
            )}
          </div>
        )}

        {/* Execute button */}
        {isPassed && !isExecuted && (
          <div className="border-t border-gray-50 pt-5">
            <button
              onClick={handleExecute}
              disabled={txPending}
              className="w-full py-2.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              執行提案
            </button>
          </div>
        )}

        {txMsg && (
          <p className={`text-xs mt-3 text-center ${txMsg.startsWith('錯誤') ? 'text-red-500' : 'text-green-600'}`}>
            {txMsg}
          </p>
        )}
      </div>
    </div>
  )
}
