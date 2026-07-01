import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import { listProjects, shortAddr, formatTime } from '../services/rpc'
import type { Project } from '../types'
import { PROJECT_CATEGORIES } from '../types'
import { Plus, Search, GitBranch, Users, Clock, ExternalLink } from 'lucide-react'
import CreateProjectModal from '../components/CreateProjectModal'
import { categoryColor } from '../components/colors'

export default function Projects() {
  const { connected } = useWallet()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await listProjects({ category, limit: 50 })
      setProjects(res.projects || [])
    } catch (e) {
      console.warn('RPC unavailable', e)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [category])

  const filtered = projects.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Projects</h1>
          <div style={{ fontSize: 13, color: '#8888aa' }}>
            {loading ? 'Loading…' : `${filtered.length} project${filtered.length !== 1 ? 's' : ''} on Canopy`}
          </div>
        </div>
        {connected && (
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={14} /> New Project
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#44445a' }} />
          <input
            className="dharma-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <select className="dharma-select" style={{ width: 'auto', minWidth: 140 }} value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {PROJECT_CATEGORIES.map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#44445a' }}>
          <div style={{ fontSize: 14, marginBottom: 8 }}>Fetching from Canopy RPC…</div>
          <div style={{ fontSize: 12, color: '#2a2a40' }}>localhost:50002</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="dharma-card" style={{ padding: 60, textAlign: 'center' }}>
          <GitBranch size={40} color="#2a2a40" style={{ margin: '0 auto 16px', display: 'block' }} />
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No projects yet</div>
          <div style={{ fontSize: 13, color: '#44445a', marginBottom: 24 }}>
            Start the Canopy node with <code style={{ fontFamily: 'JetBrains Mono', color: '#7c6af7' }}>--seed</code> to load demo data,
            or create your first project.
          </div>
          {connected && (
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={14} /> Create First Project
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {filtered.map(p => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); load() }}
        />
      )}
    </div>
  )
}

function ProjectCard({ project: p }: { project: Project }) {
  const completedMilestones = p.milestones?.filter(m => m.completed).length || 0
  const totalMilestones = p.milestones?.length || 0

  return (
    <Link to={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
      <div className="dharma-card" style={{ padding: 20, height: '100%', transition: 'border-color 0.15s, transform 0.15s', cursor: 'pointer' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#7c6af750'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1e1e30'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ flex: 1, marginRight: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: '#e8e8f4' }}>{p.name}</div>
          </div>
          <span className={`badge badge-${categoryColor(p.category)}`} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
            {p.category}
          </span>
        </div>

        {/* Description */}
        <div style={{ fontSize: 13, color: '#8888aa', lineHeight: 1.5, marginBottom: 14, minHeight: 40 }}>
          {p.description?.slice(0, 100)}{(p.description?.length || 0) > 100 ? '…' : ''}
        </div>

        {/* Milestone progress */}
        {totalMilestones > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#44445a', marginBottom: 4 }}>
              <span>Milestones</span>
              <span>{completedMilestones}/{totalMilestones}</span>
            </div>
            <div style={{ height: 3, background: '#1e1e30', borderRadius: 2 }}>
              <div style={{
                height: '100%', borderRadius: 2,
                width: `${totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0}%`,
                background: 'linear-gradient(90deg, #7c6af7, #22d3a0)',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        )}

        {/* Meta */}
        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#44445a', borderTop: '1px solid #1e1e30', paddingTop: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Users size={10} />{p.contributors?.length || 0}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <GitBranch size={10} />{p.timeline?.length || 0} events
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            <Clock size={10} />{formatTime(p.created_at)}
          </span>
        </div>

        {/* Creator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 11, color: '#44445a' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#7c6af730', border: '1px solid #7c6af750' }} />
          <span className="font-mono">{shortAddr(p.creator)}</span>
          {p.repository_url && (
            <ExternalLink size={9} style={{ marginLeft: 'auto', color: '#2a2a40' }} />
          )}
        </div>
      </div>
    </Link>
  )
}
