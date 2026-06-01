import { useEffect, useState, useRef } from 'react'
import { Check, X, Plus, ChevronDown } from 'lucide-react'
import { getReadContract, STATUS_LABEL, STATUS_COLOR } from '../utils/contract'
import { shortenAddress } from '../utils/wallet'
import ApplyModal from '../components/ApplyModal'
import CreateProposalModal from '../components/CreateProposalModal'

const PROPOSAL_TYPES = ['全部', '白名單申請', '事件/爭議', '規定修改']
const STATUS_FILTER = ['全部', 'Pending', 'Active', 'Passed', 'Rejected', 'Executed']

const MOCK_PROPOSALS = [
  {
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
  {
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
  {
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
  {
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
]

function timeLeft(deadline) {
  const now = Math.floor(Date.now() / 1000)
  const diff = Number(deadline) - now
  if (diff <= 0) return '已截止'
  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  if (days > 0) return `剩 ${days} 天 ${hours} 小時`
  return `剩 ${hours} 小時`
}

// Props: account, isDAO, onOpenProposal(proposalId)
export default function DAOPage({ account, isDAO, onOpenProposal }) {
  const [proposals, setProposals] = useState(MOCK_PROPOSALS)
  const [loading, setLoading] = useState(false)
  const [typeFilter, setTypeFilter] = useState('全部')
  const [statusFilter, setStatusFilter] = useState('全部')
  const [showApply,    setShowApply]    = useState(false)
  const [showCreate,   setShowCreate]   = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    loadProposals()
  }, [])

  async function loadProposals() {
    try {
      setLoading(true)
      const contract = await getReadContract()
      const raw = await contract.getProposals()
      if (raw.length > 0) setProposals(raw)
    } catch {
      // contract not deployed yet, keep mock data
    } finally {
      setLoading(false)
    }
  }

  function matchType(description) {
    if (typeFilter === '全部') return true
    if (typeFilter === '白名單申請') return description.includes('白名單') || description.includes('申請加入')
    if (typeFilter === '事件/爭議') return description.includes('事件') || description.includes('爭議')
    if (typeFilter === '規定修改') return description.includes('規定') || description.includes('修改')
    return true
  }

  const filtered = proposals.filter((p) => {
    const statusMatch = statusFilter === '全部' || STATUS_LABEL[p.status] === statusFilter
    return statusMatch && matchType(p.description)
  })

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">提案列表</h2>
          <p className="text-sm text-gray-400 mt-0.5">共 {proposals.length} 個提案</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => isDAO && setShowCreate(true)}
            disabled={!isDAO}
            title={!isDAO ? '需要 DAO 成員資格才能新增提案' : ''}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              isDAO
                ? 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-green-300 cursor-pointer'
                : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
            }`}
          >
            <Plus size={15} />
            新增提案
          </button>
          <button
            onClick={() => !isDAO && setShowApply(true)}
            disabled={isDAO}
            title={isDAO ? '您已經是 DAO 成員' : ''}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              !isDAO
                ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            <Plus size={15} />
            申請加入 DAO
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 shrink-0 mr-1">類型</span>
          {PROPOSAL_TYPES.map((t) => {
            const active = typeFilter === t
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 text-xs font-medium border rounded-lg transition-colors ${
                  active
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-green-300 hover:text-green-600'
                }`}
              >
                {t}
              </button>
            )
          })}
        </div>
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 hover:border-green-400 hover:text-green-700 transition-colors"
            style={{ height: '26px' }}
          >
            {statusFilter === '全部' ? '所有狀態' : statusFilter}
            <ChevronDown size={12} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-50 min-w-[100px] overflow-hidden">
              {STATUS_FILTER.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setDropdownOpen(false) }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                    statusFilter === s
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s === '全部' ? '所有狀態' : s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Proposal cards */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">載入中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">沒有符合條件的提案</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((p) => (
            <div
              key={p.proposalId.toString()}
              onClick={() => onOpenProposal(p.proposalId)}
              className="relative bg-white border border-gray-100 rounded-xl pt-8 px-5 pb-5 cursor-pointer hover:border-green-200 hover:shadow-sm transition-all"
            >
              {/* Bookmark tab */}
              <div
                className={`absolute top-0 right-8 flex items-center justify-center text-xs font-medium tracking-wide ${STATUS_COLOR[p.status]}`}
                style={{
                  width: '64px',
                  paddingTop: '4px',
                  paddingBottom: '14px',
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 70%, 0 100%)',
                }}
              >
                {STATUS_LABEL[p.status]}
              </div>

              <div className="flex items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 font-medium text-sm leading-relaxed truncate">
                    {p.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    提案人：{shortenAddress(p.proposerAddress)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-2 flex-1">
                  <span className="flex items-center gap-0.5 text-green-600 font-medium"><Check size={12} />{p.yesVotes.toString()}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 overflow-hidden">
                    {Number(p.yesVotes) + Number(p.noVotes) > 0 && (
                      <div
                        className="h-full bg-green-400"
                        style={{
                          width: `${(Number(p.yesVotes) / (Number(p.yesVotes) + Number(p.noVotes))) * 100}%`,
                        }}
                      />
                    )}
                  </div>
                  <span className="flex items-center gap-0.5 text-red-400 font-medium"><X size={12} />{p.noVotes.toString()}</span>
                </div>
                <span>{timeLeft(p.deadline)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showApply  && <ApplyModal          account={account} onClose={() => setShowApply(false)}  onSuccess={loadProposals} />}
      {showCreate && <CreateProposalModal account={account} onClose={() => setShowCreate(false)} onSuccess={loadProposals} />}
    </div>
  )
}
