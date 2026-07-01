import { useState } from 'react'
import { X, MessageSquare, Loader } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import { createDiscussion } from '../services/rpc'
import { ToastContext } from '../App'

interface Props {
  projectId: string
  onClose: () => void
  onSuccess: () => void
}

export default function CreateDiscussionModal({ projectId, onClose, onSuccess }: Props) {
  const { address } = useWallet()
  const [form, setForm] = useState({ title: '', body: '' })
  const [loading, setLoading] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async () => {
    if (!address) return
    if (!form.title.trim()) { ToastContext.show({ type: 'error', message: 'Discussion title required' }); return }
    setLoading(true)
    try {
      const res = await createDiscussion(address, { project_id: projectId, ...form })
      ToastContext.show({ type: 'success', message: 'Discussion created!', txHash: res.tx_hash })
      onSuccess()
    } catch (e: any) {
      ToastContext.show({ type: 'error', message: e.message || 'Failed to create discussion' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000090', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="dharma-card" style={{ padding: 32, width: 480, position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#44445a' }}><X size={16} /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #38bdf8, #7c6af7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={18} color="white" />
          </div>
          <div>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 18 }}>Create Discussion</div>
            <div style={{ fontSize: 12, color: '#8888aa' }}>Writes CREATE_DISCUSSION to Canopy</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="dharma-label">Title *</label>
            <input className="dharma-input" placeholder="e.g. Should we rewrite the backend?" value={form.title} onChange={set('title')} />
          </div>
          <div>
            <label className="dharma-label">Body</label>
            <textarea className="dharma-textarea" placeholder="Describe the decision or topic…" value={form.body} onChange={set('body')} rows={4} />
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSubmit} disabled={loading}>
              {loading ? <><Loader size={14} className="spin" /> Submitting…</> : 'Open Discussion →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
