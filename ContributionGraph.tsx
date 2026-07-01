import type { Contributor } from '../types'
import { shortAddr } from '../services/rpc'

interface Props {
  contributors: Contributor[]
  projectName: string
}

export default function ContributionGraph({ contributors, projectName }: Props) {
  const cx = 280
  const cy = 180
  const radius = 110

  const roleColor = (role: string) => {
    if (role === 'creator') return '#7c6af7'
    if (role === 'reviewer') return '#c084fc'
    if (role === 'designer') return '#38bdf8'
    return '#22d3a0'
  }

  return (
    <div style={{ background: '#0a0a12', border: '1px solid #1e1e30', borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 12, color: '#44445a', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 16 }}>
        CONTRIBUTION NETWORK
      </div>
      <svg width="100%" viewBox="0 0 560 360" style={{ display: 'block' }}>
        {/* Center node: project */}
        <circle cx={cx} cy={cy} r={36} fill="#7c6af718" stroke="#7c6af750" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={28} fill="#7c6af730" />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#9d8fff" fontSize={9} fontWeight={700} fontFamily="Space Grotesk">
          {projectName.slice(0, 10)}
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="#7c6af7" fontSize={7} fontFamily="JetBrains Mono">
          PROJECT
        </text>

        {contributors.slice(0, 8).map((c, i) => {
          const angle = (i / Math.min(contributors.length, 8)) * Math.PI * 2 - Math.PI / 2
          const x = cx + Math.cos(angle) * radius
          const y = cy + Math.sin(angle) * radius
          const color = roleColor(c.role)

          return (
            <g key={c.address}>
              {/* Line to center */}
              <line x1={cx} y1={cy} x2={x} y2={y}
                stroke={color} strokeWidth={0.8} strokeOpacity={0.3} strokeDasharray="4,4" />

              {/* Contributor node */}
              <circle cx={x} cy={y} r={22} fill={`${color}15`} stroke={`${color}60`} strokeWidth={1.2} />
              <circle cx={x} cy={y} r={14} fill={`${color}25`} />

              {/* Role label */}
              <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                fill={color} fontSize={7} fontWeight={700} fontFamily="Space Grotesk">
                {c.role?.slice(0, 4).toUpperCase()}
              </text>

              {/* Address below */}
              <text x={x} y={y + 28} textAnchor="middle"
                fill="#8888aa" fontSize={7} fontFamily="JetBrains Mono">
                {shortAddr(c.address).slice(0, 10)}
              </text>

              {/* Event count badge */}
              {c.event_count > 0 && (
                <>
                  <circle cx={x + 14} cy={y - 14} r={8} fill={color} />
                  <text x={x + 14} y={y - 14} textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize={7} fontWeight={700}>
                    {c.event_count}
                  </text>
                </>
              )}
            </g>
          )
        })}

        {/* Orbital ring */}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#1e1e30" strokeWidth={0.5} strokeDasharray="3,6" />
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', borderTop: '1px solid #1e1e30', paddingTop: 12, marginTop: 4 }}>
        {[
          { role: 'creator', color: '#7c6af7' },
          { role: 'contributor', color: '#22d3a0' },
          { role: 'reviewer', color: '#c084fc' },
          { role: 'designer', color: '#38bdf8' },
        ].map(({ role, color }) => (
          <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#8888aa' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            {role}
          </div>
        ))}
      </div>
    </div>
  )
}
