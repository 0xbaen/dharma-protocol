import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import { listProjects, listTransactions, getStats, shortAddr, shortHash, formatTime } from '../services/rpc'
import type { Project, TransactionRecord } from '../types'
import { TX_NAMES } from '../types'
import { Plus, Wallet, Activity, GitBranch, Users, Zap } from 'lucide-react'
import CreateProjectModal from '../components/CreateProjectModal'
import { categoryColor, eventColor } from '../components/colors'

export default function Dashboard() {
  const { connected, address } = useWallet()
  const [projects, setProjects] = useState<Project[]>([])
  const [txs, setTxs] = useState<TransactionRecord[]>([])
  const [stats, setStats] = useState({ total_projects: 0, total_transactions: 0, total_contributors: 0, block_height: 0 })
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const load = async () => {
    try {
      const [pRes, tRes, sRes] = await Promise.all([
        listProjects({ limit: 6 }),
        listTransactions(10),
        getStats(),
      ])
      setProjects(pRes.projects || [])
      setTxs(tRes.transactions || [])
      setStats(sRes)
    } catch (e) {
      console.warn('RPC not available — showing empty state', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
          {connected && address
            ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#8888aa' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3a0' }} />
                <span className="font-mono">{address}</span>
              </div>
            : <div style={{ fontSize: 13, color: '#44445a' }}>Connect wallet to submit transactions</div>}
        </div>
        {connected && (
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={14} /> New Project
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Projects', value: stats.total_projects, icon: <GitBranch size={16} color="#7c6af7" />, color: '#7c6af7' },
          { label: 'Transactions', value: stats.total_transactions, icon: <Zap size={16} color="#22d3a0" />, color: '#22d3a0' },
          { label: 'Contributors', value: stats.total_contributors, icon: <Users size={16} color="#c084fc" />, color: '#c084fc' },
          { label: 'Block Height', value: stats.block_height, icon: <Activity size={16} color="#f59e0b" />, color: '#f59e0b' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="dharma-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: '#44445a', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
              {icon}
            </div>
            <div className="font-display" style={{ fontSize: 28, fontWeight: 700, color }}>{loading ? '—' : value}</div>
          </div>
        ))}
      </div>

      {/* Wallet Connect CTA */}
      {!connected && (
        <div className="dharma-card" style={{ padding: 32, textAlign: 'center', marginBottom: 32, background: '#7c6af708', borderColor: '#7c6af730' }}>
          <Wallet size={32} color="#7c6af7" style={{ margin: '0 auto 12px' }} />
          <h3 className="font-display" style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Connect Your Wallet</h3>
          <p style={{ color: '#8888aa', fontSize: 14, marginBottom: 16 }}>Connect to create projects, add timeline events, and earn onchain contribution history.</p>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>Get Started</Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Projects */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Recent Projects</h2>
            <Link to="/projects" style={{ fontSize: 12, color: '#7c6af7', textDecoration: 'none' }}>View all →</Link>
          </div>
          {loading ? (
            <div style={{ color: '#44445a', textAlign: 'center', padding: 40 }}>Loading from Canopy RPC…</div>
          ) : projects.length === 0 ? (
            <EmptyState message="No projects yet. Start the Canopy node with --seed to load demo data." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {projects.map(p => (
                <Link key={p.id} to={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div className="dharma-card" style={{ padding: 16, cursor: 'pointer', transition: 'border-color 0.15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                      <span className={`badge badge-${categoryColor(p.category)}`}>{p.category}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#8888aa', marginBottom: 10, lineHeight: 1.5 }}>
                      {p.description?.slice(0, 90)}{p.description?.length > 90 ? '…' : ''}
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#44445a' }}>
                      <span>{p.contributors?.length || 0} contributors</span>
                      <span>{p.timeline?.length || 0} events</span>
                      <span>{p.milestones?.filter(m => m.completed).length || 0}/{p.milestones?.length || 0} milestones</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Activity Feed</h2>
            <Link to="/explorer" style={{ fontSize: 12, color: '#7c6af7', textDecoration: 'none' }}>Explorer →</Link>
          </div>
          {loading ? (
            <div style={{ color: '#44445a', textAlign: 'center', padding: 40 }}>Loading…</div>
          ) : txs.length === 0 ? (
            <EmptyState message="No transactions yet." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {txs.slice(0, 8).map(tx => (
                <div key={tx.hash} className="dharma-card" style={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span className="badge badge-purple" style={{ fontSize: 10 }}>{tx.tx_type_name}</span>
                    <span style={{ fontSize: 10, color: '#44445a' }}>block #{tx.block_height}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#8888aa' }}>{shortAddr(tx.sender)}</div>
                  <div className="hash-display">{shortHash(tx.hash)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); load() }}
        />
      )}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="dharma-card" style={{ padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 13, color: '#44445a' }}>{message}</div>
    </div>
  )
}
