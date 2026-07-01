import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { WalletContext, useWalletState } from './hooks/useWallet'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Explorer from './pages/Explorer'
import { CheckCircle, XCircle, X } from 'lucide-react'

export interface Toast {
  id: string
  type: 'success' | 'error'
  message: string
  txHash?: string
}

export const ToastContext = {
  show: (_toast: Omit<Toast, 'id'>) => {},
}

function App() {
  const wallet = useWalletState()
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { ...toast, id }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  // Expose globally so child components can call it
  useEffect(() => {
    ToastContext.show = showToast
  }, [])

  return (
    <WalletContext.Provider value={wallet}>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', background: '#050508' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/explorer" element={<Explorer />} />
          </Routes>
        </div>

        {/* Toast notifications */}
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {toasts.map(toast => (
            <div key={toast.id} className={`toast ${toast.type === 'error' ? 'toast-error' : ''}`}>
              {toast.type === 'success'
                ? <CheckCircle size={18} color="#22d3a0" />
                : <XCircle size={18} color="#f43f5e" />}
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{toast.message}</div>
                {toast.txHash && (
                  <div className="hash-display" style={{ marginTop: 2 }}>
                    tx: {toast.txHash.slice(0, 20)}…
                  </div>
                )}
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#44445a', marginLeft: 8 }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </BrowserRouter>
    </WalletContext.Provider>
  )
}

export default App
