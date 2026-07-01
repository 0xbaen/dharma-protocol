import { useState } from 'react'
import { X, UserPlus, Loader } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import { joinProject } from '../services/rpc'
import { ToastContext } from '../App'

interface Props {
  projectId: string
  projectName: string
  onClose: () => void
  onSuccess: () => void
}

export default function JoinProjectModal({ projectId, projectName, onClose, onSuccess }: Props) {
  const { address } = useWallet()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!address) return
    setLoading(true)
    try {
      const res = await joinProject(address, projectId, message)
      ToastContext.show({ type: 'success', message: `Joined ${projectName}!`, txHash: res.tx_hash })
      onSuccess()
    } catch (e: any) {
      ToastContext.show({ type: 'error', message: e.message || 'Failed to join project' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000090', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="dharma-card" style={{ padding: 32, width: 440, position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#44445a' }}><X size={16} /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #22d3a0, #7c6af7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserPlus size={18} color="white" />
          </div>
          <div>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 18 }}>Join Project</div>
            <div style={{ fontSize: 12, color: '#8888aa' }}>Writes JOIN_PROJECT to Canopy</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '10px 14px', background: '#0a0a12', borderRadius: 8, border: '1px solid #1e1e30' }}>
            <div style={{ fontSize: 11, color: '#44445a', marginBottom: 2 }}>PROJECT</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{projectName}</div>
          </div>
          <div>
            <label className="dharma-label">Message (optional)</label>
            <textarea className="dharma-textarea" placeholder="Why do you want to contribute?" value={message} onChange={e => setMessage(e.target.value)} rows={3} />
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSubmit} disabled={loading}>
              {loading ? <><Loader size={14} className="spin" /> Joining…</> : 'Join Project →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
