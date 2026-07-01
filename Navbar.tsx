import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { Layers, LayoutDashboard, FolderOpen, Search, Wallet, X, ChevronDown } from 'lucide-react'
import { shortAddr } from '../services/rpc'

export default function Navbar() {
  const { connected, address, connect, disconnect } = useWallet()
  const location = useLocation()
  const [showWalletMenu, setShowWalletMenu] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [customAddr, setCustomAddr] = useState('')

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  const handleConnect = () => {
    connect(customAddr.trim() || undefined)
    setShowConnectModal(false)
    setCustomAddr('')
  }

  return (
    <>
      <nav style={{
        background: '#05050880',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1e1e30',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #7c6af7, #22d3a0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Layers size={16} color="white" />
          </div>
          <span className="font-display" style={{ fontWeight: 700, fontSize: 16, color: '#e8e8f4' }}>
            dharma
          </span>
          <span style={{ fontSize: 11, color: '#44445a', fontWeight: 500, marginTop: 1 }}>protocol</span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
            { to: '/projects', label: 'Projects', icon: <FolderOpen size={14} /> },
            { to: '/explorer', label: 'Explorer', icon: <Search size={14} /> },
          ].map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14, fontWeight: 500,
                color: isActive(to) ? '#9d8fff' : '#8888aa',
                background: isActive(to) ? '#7c6af715' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              {icon}{label}
            </Link>
          ))}
        </div>

        {/* Wallet */}
        <div style={{ position: 'relative' }}>
          {connected && address ? (
            <button
              onClick={() => setShowWalletMenu(!showWalletMenu)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#13131f', border: '1px solid #7c6af740',
                borderRadius: 8, padding: '7px 12px', cursor: 'pointer',
                color: '#9d8fff', fontSize: 13, fontFamily: 'Space Grotesk',
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3a0' }} />
              <span className="font-mono" style={{ fontSize: 12 }}>{shortAddr(address)}</span>
              <ChevronDown size={12} />
            </button>
          ) : (
            <button className="btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}
              onClick={() => setShowConnectModal(true)}>
              <Wallet size={14} /> Connect Wallet
            </button>
          )}

          {/* Wallet dropdown */}
          {showWalletMenu && connected && (
            <div style={{
              position: 'absolute', top: '110%', right: 0,
              background: '#13131f', border: '1px solid #1e1e30',
              borderRadius: 10, padding: 16, minWidth: 240,
              boxShadow: '0 8px 32px #00000080',
            }}>
              <div style={{ fontSize: 11, color: '#44445a', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 8 }}>CONNECTED WALLET</div>
              <div className="font-mono" style={{ fontSize: 12, color: '#9d8fff', wordBreak: 'break-all', marginBottom: 16 }}>{address}</div>
              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
                onClick={() => { disconnect(); setShowWalletMenu(false) }}>
                Disconnect
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Connect Modal */}
      {showConnectModal && (
        <div style={{
          position: 'fixed', inset: 0, background: '#00000080',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
          backdropFilter: 'blur(4px)',
        }} onClick={() => setShowConnectModal(false)}>
          <div className="dharma-card" style={{ padding: 32, width: 420, position: 'relative' }}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowConnectModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#44445a' }}>
              <X size={16} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #7c6af7, #22d3a0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={18} color="white" />
              </div>
              <div>
                <div className="font-display" style={{ fontWeight: 700, fontSize: 18 }}>Connect Wallet</div>
                <div style={{ fontSize: 13, color: '#8888aa' }}>Connect to Canopy Network</div>
              </div>
            </div>
            <label className="dharma-label">Wallet Address (optional)</label>
            <input
              className="dharma-input"
              placeholder="cnpy1... or leave blank for auto-generated"
              value={customAddr}
              onChange={e => setCustomAddr(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <p style={{ fontSize: 12, color: '#44445a', marginBottom: 20 }}>
              Enter a Canopy address or leave blank to generate one. All transactions will originate from this address.
            </p>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleConnect}>
              <Wallet size={14} /> Connect Wallet
            </button>
          </div>
        </div>
      )}

      {showWalletMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowWalletMenu(false)} />}
    </>
  )
}
