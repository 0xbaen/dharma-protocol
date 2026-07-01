import { useState, useEffect, useCallback } from 'react'
import { listTransactions, getStats, shortAddr, shortHash, formatTime } from '../services/rpc'
import type { TransactionRecord } from '../types'
import { TX_NAMES } from '../types'
import { Activity, Search, RefreshCw, Zap, Hash, Clock, User, Layers } from 'lucide-react'

const TX_COLORS: Record<number, string> = {
  1001: '#7c6af7', // CREATE_PROJECT
  1002: '#22d3a0', // JOIN_PROJECT
  1003: '#38bdf8', // INVITE_CONTRIBUTOR
  1004: '#22d3a0', // ACCEPT_INVITATION
  1005: '#c084fc', // ADD_TIMELINE_EVENT
  1006: '#f59e0b', // CREATE_MILESTONE
  1007: '#22d3a0', // COMPLETE_MILESTONE
  1008: '#38bdf8', // LINK_GITHUB_COMMIT
  1009: '#22d3a0', // ADD_RELEASE
  1010: '#7c6af7', // ENDORSE_CONTRIBUTION
  1011: '#38bdf8', // CREATE_DISCUSSION
  1012: '#22d3a0', // RESOLVE_DISCUSSION
}

export default function Explorer() {
  const [txs, setTxs] = useState<TransactionRecord[]>([])
  const [stats, setStats] = useState({ total_projects: 0, total_transactions: 0, total_contributors: 0, block_height: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<number | ''>('')
  const [limit, setLimit] = useState(50)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const load = useCallback(async () => {
    try {
      const [tRes, sRes] = await Promise.all([listTransactions(limit), getStats()])
      setTxs(tRes.transactions || [])
      setStats(sRes)
    } catch (e) {
      console.warn('RPC unavailable', e)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [autoRefresh, load])

  const filtered = txs.filter(tx => {
    if (filterType && tx.tx_type !== filterType) return false
    if (search) {
      const q = search.toLowerCase()
      return tx.hash.includes(q) || tx.sender.includes(q) || tx.tx_type_name.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Blockchain Explorer</h1>
          <div style={{ fontSize: 13, color: '#8888aa' }}>
            All Dharma Protocol transactions on Canopy Network
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={autoRefresh ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 13 }}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity size={13} className={autoRefresh ? 'pulse-glow' : ''} />
            {autoRefresh ? 'Live' : 'Auto'}
          </button>
          <button className="btn-secondary" style={{ fontSize: 13 }} onClick={load}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Chain Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Block Height', value: stats.block_height, icon: <Layers size={15} color="#7c6af7" />, color: '#7c6af7' },
          { label: 'Total Transactions', value: stats.total_transactions, icon: <Zap size={15} color="#22d3a0" />, color: '#22d3a0' },
          { label: 'Projects', value: stats.total_projects, icon: <Hash size={15} color="#c084fc" />, color: '#c084fc' },
          { label: 'Contributors', value: stats.total_contributors, icon: <User size={15} color="#f59e0b" />, color: '#f59e0b' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="dharma-card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: '#44445a', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
              {icon}
            </div>
            <div className="font-display" style={{ fontSize: 26, fontWeight: 700, color }}>{loading ? '—' : value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#44445a' }} />
          <input className="dharma-input" style={{ paddingLeft: 36 }} placeholder="Search by hash, sender, or type…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="dharma-select" style={{ width: 'auto', minWidth: 180 }} value={filterType} onChange={e => setFilterType(e.target.value === '' ? '' : Number(e.target.value))}>
          <option value="">All Types</option>
          {Object.entries(TX_NAMES).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        <select className="dharma-select" style={{ width: 'auto', minWidth: 100 }} value={limit} onChange={e => setLimit(Number(e.target.value))}>
          <option value={25}>25 txs</option>
          <option value={50}>50 txs</option>
          <option value={100}>100 txs</option>
        </select>
      </div>

      {/* Results count */}
      <div style={{ fontSize: 12, color: '#44445a', marginBottom: 12 }}>
        Showing {filtered.length} of {txs.length} transactions
        {autoRefresh && <span style={{ color: '#22d3a0', marginLeft: 8 }}>● Live</span>}
      </div>

      {/* Transaction List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#44445a' }}>
          <div style={{ marginBottom: 8 }}>Fetching from Canopy RPC…</div>
          <div style={{ fontSize: 12, color: '#2a2a40', fontFamily: 'JetBrains Mono' }}>localhost:50002/rpc</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="dharma-card" style={{ padding: 60, textAlign: 'center' }}>
          <Activity size={40} color="#2a2a40" style={{ margin: '0 auto 16px', display: 'block' }} />
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>No transactions yet</div>
          <div style={{ fontSize: 13, color: '#44445a' }}>
            Start the Canopy node with <code style={{ fontFamily: 'JetBrains Mono', color: '#7c6af7' }}>--seed</code> to load demo transactions,
            or connect your wallet and create a project.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 160px 100px 120px', gap: 12, padding: '8px 16px', fontSize: 11, color: '#44445a', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <span>Type</span>
            <span>Transaction Hash</span>
            <span>Sender</span>
            <span>Block</span>
            <span>Time</span>
          </div>

          {filtered.map((tx, i) => {
            const color = TX_COLORS[tx.tx_type] || '#7c6af7'
            return (
              <div
                key={tx.hash}
                className="dharma-card"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr 160px 100px 120px',
                  gap: 12,
                  padding: '14px 16px',
                  alignItems: 'center',
                  borderRadius: i === 0 ? '10px 10px 4px 4px' : i === filtered.length - 1 ? '4px 4px 10px 10px' : '4px',
                  borderTop: i === 0 ? undefined : '1px solid #0f0f1a',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#161622'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#13131f'}
              >
                {/* Type */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 3, height: 20, borderRadius: 2, background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color, fontFamily: 'JetBrains Mono', letterSpacing: '0.02em' }}>
                    {tx.tx_type_name || TX_NAMES[tx.tx_type]}
                  </span>
                </div>

                {/* Hash */}
                <div className="font-mono" style={{ fontSize: 11, color: '#9d8fff', letterSpacing: '0.02em' }}>
                  {tx.hash?.slice(0, 32)}…
                </div>

                {/* Sender */}
                <div className="font-mono" style={{ fontSize: 11, color: '#8888aa' }}>
                  {shortAddr(tx.sender)}
                </div>

                {/* Block */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#44445a' }}>
                  <Hash size={10} />
                  {tx.block_height}
                </div>

                {/* Time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#44445a' }}>
                  <Clock size={10} />
                  {formatTime(tx.timestamp)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer note */}
      <div style={{ marginTop: 24, padding: '14px 18px', background: '#0a0a12', borderRadius: 8, border: '1px solid #1e1e30', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3a0' }} />
        <span style={{ fontSize: 12, color: '#44445a' }}>
          All transactions are custom Canopy types 1001–1012. State is derived from these transactions on node startup.
          Every action you take in Dharma Protocol creates a real blockchain transaction via JSON-RPC.
        </span>
      </div>
    </div>
  )
}
