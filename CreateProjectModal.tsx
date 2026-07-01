import { useState } from 'react'
import { X, GitBranch, Loader } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import { createProject } from '../services/rpc'
import { ToastContext } from '../App'
import { PROJECT_CATEGORIES } from '../types'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function CreateProjectModal({ onClose, onSuccess }: Props) {
  const { address } = useWallet()
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'socialfi',
    repository_url: '',
  })
  const [loading, setLoading] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async () => {
    if (!address) return
    if (!form.name.trim()) { ToastContext.show({ type: 'error', message: 'Project name required' }); return }
    setLoading(true)
    try {
      const res = await createProject(address, form)
      ToastContext.show({ type: 'success', message: `Project created!`, txHash: res.tx_hash })
      onSuccess()
    } catch (e: any) {
      ToastContext.show({ type: 'error', message: e.message || 'Failed to create project' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#00000090',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
      backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div className="dharma-card" style={{ padding: 32, width: 480, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#44445a' }}>
          <X size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #7c6af7, #22d3a0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GitBranch size={18} color="white" />
          </div>
          <div>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 18 }}>Create Project</div>
            <div style={{ fontSize: 12, color: '#8888aa' }}>Writes CREATE_PROJECT to Canopy</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="dharma-label">Project Name *</label>
            <input className="dharma-input" placeholder="e.g. Dharma Protocol" value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className="dharma-label">Description</label>
            <textarea className="dharma-textarea" placeholder="What are you building?" value={form.description} onChange={set('description')} rows={3} />
          </div>
          <div>
            <label className="dharma-label">Category</label>
            <select className="dharma-select" value={form.category} onChange={set('category')}>
              {PROJECT_CATEGORIES.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="dharma-label">Repository URL</label>
            <input className="dharma-input" placeholder="https://github.com/..." value={form.repository_url} onChange={set('repository_url')} />
          </div>

          <div style={{ padding: '10px 14px', background: '#0a0a12', borderRadius: 8, border: '1px solid #1e1e30' }}>
            <div style={{ fontSize: 11, color: '#44445a', marginBottom: 2 }}>CREATOR</div>
            <div className="font-mono" style={{ fontSize: 12, color: '#9d8fff', wordBreak: 'break-all' }}>{address}</div>
          </div>

          <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSubmit} disabled={loading}>
              {loading ? <><Loader size={14} className="spin" /> Submitting…</> : 'Create Project →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
