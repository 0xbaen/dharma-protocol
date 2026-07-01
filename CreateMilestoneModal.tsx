import { useState } from 'react'
import { X, Target, Loader } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import { createMilestone } from '../services/rpc'
import { ToastContext } from '../App'

interface Props {
  projectId: string
  onClose: () => void
  onSuccess: () => void
}

export default function CreateMilestoneModal({ projectId, onClose, onSuccess }: Props) {
  const { address } = useWallet()
  const [form, setForm] = useState({ title: '', description: '' })
  const [loading, setLoading] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async () => {
    if (!address) return
    if (!form.title.trim()) { ToastContext.show({ type: 'error', message: 'Milestone title required' }); return }
    setLoading(true)
    try {
      const res = await createMilestone(address, { project_id: projectId, ...form })
      ToastContext.show({ type: 'success', message: 'Milestone created!', txHash: res.tx_hash })
      onSuccess()
    } catch (e: any) {
      ToastContext.show({ type: 'error', message: e.message || 'Failed to create milestone' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000090', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="dharma-card" style={{ padding: 32, width: 440, position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#44445a' }}><X size={16} /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b, #f43f5e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={18} color="white" />
          </div>
          <div>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 18 }}>Create Milestone</div>
            <div style={{ fontSize: 12, color: '#8888aa' }}>Writes CREATE_MILESTONE to Canopy</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="dharma-label">Title *</label>
            <input className="dharma-input" placeholder="e.g. Deploy to Canopy Testnet" value={form.title} onChange={set('title')} />
          </div>
          <div>
            <label className="dharma-label">Description</label>
            <textarea className="dharma-textarea" placeholder="What needs to be done?" value={form.description} onChange={set('description')} rows={3} />
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSubmit} disabled={loading}>
              {loading ? <><Loader size={14} className="spin" /> Submitting…</> : 'Create Milestone →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
