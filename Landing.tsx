import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layers, ArrowRight, Zap, GitBranch, Users, Shield } from 'lucide-react'

const timelineSteps = [
  { category: 'idea', icon: '💡', title: 'Project Created', desc: 'Dharma Protocol', time: '2 hours ago' },
  { category: 'community', icon: '👤', title: 'Alice joins', desc: 'Frontend Developer', time: '90 min ago' },
  { category: 'community', icon: '👤', title: 'Bob joins', desc: 'Smart Contract Dev', time: '1 hour ago' },
  { category: 'design', icon: '🎨', title: 'Frontend completed', desc: 'React + TailwindCSS', time: '45 min ago' },
  { category: 'development', icon: '🔧', title: 'Carol reviewed code', desc: 'All tests passing', time: '30 min ago' },
  { category: 'testing', icon: '✅', title: 'Bug fixed', desc: 'Critical path issue resolved', time: '15 min ago' },
  { category: 'deployment', icon: '🚀', title: 'v1.0 released', desc: 'Live on Canopy testnet', time: 'just now' },
]

const categoryColors: Record<string, string> = {
  idea: '#7c6af7',
  community: '#22d3a0',
  design: '#c084fc',
  development: '#38bdf8',
  testing: '#f59e0b',
  deployment: '#22d3a0',
  milestone: '#f59e0b',
}

export default function Landing() {
  const [visibleSteps, setVisibleSteps] = useState(0)

  useEffect(() => {
    if (visibleSteps < timelineSteps.length) {
      const t = setTimeout(() => setVisibleSteps(v => v + 1), 400)
      return () => clearTimeout(t)
    }
  }, [visibleSteps])

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        padding: '80px 24px 60px',
        maxWidth: 1200,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 64,
        alignItems: 'center',
      }}>
        {/* Left: Copy */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#7c6af715', border: '1px solid #7c6af730', borderRadius: 100, padding: '4px 12px', marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3a0' }} className="pulse-glow" />
            <span style={{ fontSize: 12, color: '#9d8fff', fontWeight: 600, letterSpacing: '0.06em' }}>BUILT ON CANOPY NETWORK</span>
          </div>

          <h1 className="font-display" style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
            The Onchain Memory Layer for{' '}
            <span className="gradient-text">Open Collaboration</span>
          </h1>

          <p style={{ fontSize: 18, color: '#8888aa', lineHeight: 1.7, marginBottom: 32 }}>
            Dharma Protocol permanently preserves the complete social history of collaborative projects.
            Every contribution, milestone, and discussion becomes an immutable part of the project's DNA.
          </p>

          <div style={{ display: 'flex', gap: 12, marginBottom: 48 }}>
            <Link to="/dashboard" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 24px', fontSize: 15 }}>
              Open Dashboard <ArrowRight size={16} />
            </Link>
            <Link to="/projects" className="btn-secondary" style={{ textDecoration: 'none', padding: '12px 24px', fontSize: 15 }}>
              Explore Projects
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 32 }}>
            {[
              { label: 'Transaction Types', value: '12' },
              { label: 'Canopy RPC', value: ':50002' },
              { label: 'State', value: 'Onchain' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="font-display gradient-text" style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
                <div style={{ fontSize: 12, color: '#44445a', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Animated Timeline */}
        <div style={{ position: 'relative' }}>
          <div style={{
            background: '#0a0a12',
            border: '1px solid #1e1e30',
            borderRadius: 16,
            padding: 24,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #1e1e30' }}>
              <Layers size={14} color="#7c6af7" />
              <span style={{ fontSize: 12, color: '#7c6af7', fontWeight: 600, letterSpacing: '0.06em' }}>LIVE TIMELINE</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                {['#f43f5e', '#f59e0b', '#22d3a0'].map(c => (
                  <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                ))}
              </div>
            </div>

            {/* Timeline steps */}
            <div style={{ position: 'relative' }}>
              <div className="timeline-line" />
              {timelineSteps.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 12,
                    paddingLeft: 32,
                    marginBottom: i < timelineSteps.length - 1 ? 16 : 0,
                    opacity: i < visibleSteps ? 1 : 0,
                    transform: i < visibleSteps ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'all 0.4s ease',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    left: 13, top: 2,
                    width: 12, height: 12,
                    borderRadius: '50%',
                    background: categoryColors[step.category] || '#7c6af7',
                    boxShadow: `0 0 8px ${categoryColors[step.category] || '#7c6af7'}80`,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#e8e8f4' }}>{step.title}</span>
                        <div style={{ fontSize: 11, color: '#8888aa', marginTop: 1 }}>{step.desc}</div>
                      </div>
                      <span style={{ fontSize: 10, color: '#44445a', whiteSpace: 'nowrap', marginLeft: 8 }}>{step.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Glow effect */}
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0, height: 80,
              background: 'linear-gradient(to top, #0a0a12, transparent)',
              pointerEvents: 'none',
            }} />
          </div>

          {/* Floating badge */}
          <div style={{
            position: 'absolute',
            bottom: -16, right: -16,
            background: '#13131f',
            border: '1px solid #22d3a040',
            borderRadius: 8,
            padding: '8px 14px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3a0' }} />
            <span className="font-mono" style={{ fontSize: 11, color: '#22d3a0' }}>All events onchain</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 24px', background: '#0a0a1280', borderTop: '1px solid #1e1e30' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, color: '#7c6af7', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 12 }}>
              WHY DHARMA PROTOCOL
            </div>
            <h2 className="font-display" style={{ fontSize: 36, fontWeight: 700 }}>
              Collaboration as Immutable History
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[
              { icon: <GitBranch size={20} color="#7c6af7" />, title: '12 Custom Tx Types', desc: 'CREATE_PROJECT through RESOLVE_DISCUSSION — every action is a first-class blockchain event.' },
              { icon: <Zap size={20} color="#22d3a0" />, title: 'Real RPC Integration', desc: 'No mocked data. Every action creates a real Canopy transaction via JSON-RPC on port 50002.' },
              { icon: <Users size={20} color="#c084fc" />, title: 'Project DNA', desc: 'Visual timeline, milestone tree, and contribution graph show the full evolution of every project.' },
              { icon: <Shield size={20} color="#f59e0b" />, title: 'Permanent History', desc: 'Who built what, who reviewed it, who shipped it. Immutably recorded. Forever.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="dharma-card" style={{ padding: 24 }}>
                <div style={{ marginBottom: 16 }}>{icon}</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 13, color: '#8888aa', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 className="font-display" style={{ fontSize: 40, fontWeight: 700, marginBottom: 16 }}>
          Start Building Permanent History
        </h2>
        <p style={{ fontSize: 16, color: '#8888aa', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
          Connect your wallet and create your first project. Every contribution becomes permanent on Canopy.
        </p>
        <Link to="/dashboard" className="btn-primary" style={{ textDecoration: 'none', padding: '14px 32px', fontSize: 16 }}>
          Launch App <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  )
}
