import { useState } from 'react'
import { X, Package, Loader } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import { addRelease } from '../services/rpc'
import { ToastContext } from '../App'
import type { Contributor } from '../types'

interface Props {
  projectId: string
  contributors: Contributor[]
  onClose: () => void
  onSuccess: () => void
}

export default function AddReleaseModal({ projectId, contributors, onClose, onSuccess }: Props) {
  const { address } = useWallet()
  const [form, setForm] = useState({ version: '', summary: '', release_notes: '' })
  const [loading, setLoading] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async () => {
    if (!address) return
    if (!form.version.trim()) { ToastContext.show({ type: 'error', message: 'Version required' }); return }
    setLoading(true)
    try {
      const res = await addRelease(address, {
        project_id: projectId,
        ...form,
        contributors: contributors.map(c => c.address),
      })
      ToastContext.show({ type: 'success', message: `Release ${form.version} published!`, txHash: res.tx_hash })
      onSuccess()
    } catch (e: any) {
      ToastContext.show({ type: 'error', message: e.message || 'Failed to publish release' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000090', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="dharma-card" style={{ padding: 32, width: 460, position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#44445a' }}><X size={16} /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #22d3a0, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={18} color="white" />
          </div>
          <div>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 18 }}>Publish Release</div>
            <div style={{ fontSize: 12, color: '#8888aa' }}>Writes ADD_RELEASE to Canopy</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="dharma-label">Version *</label>
            <input className="dharma-input" placeholder="e.g. v1.0.0" value={form.version} onChange={set('version')} />
          </div>
          <div>
            <label className="dharma-label">Summary</label>
            <input className="dharma-input" placeholder="One-line description" value={form.summary} onChange={set('summary')} />
          </div>
          <div>
            <label className="dharma-label">Release Notes</label>
            <textarea className="dharma-textarea" placeholder="What changed in this release?" value={form.release_notes} onChange={set('release_notes')} rows={4} />
          </div>
          <div style={{ padding: '10px 14px', background: '#0a0a12', borderRadius: 8, border: '1px solid #1e1e30' }}>
            <div style={{ fontSize: 11, color: '#44445a', marginBottom: 4 }}>CONTRIBUTORS ({contributors.length})</div>
            <div style={{ fontSize: 12, color: '#8888aa' }}>{contributors.map(c => c.address.slice(0, 12) + '…').join(', ')}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSubmit} disabled={loading}>
              {loading ? <><Loader size={14} className="spin" /> Publishing…</> : 'Publish Release →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
