// Category and event color helpers

export function categoryColor(cat: string): string {
  const map: Record<string, string> = {
    defi: 'emerald',
    infrastructure: 'sky',
    socialfi: 'purple',
    nft: 'amber',
    dao: 'rose',
    tooling: 'sky',
    research: 'amber',
    other: 'dim',
  }
  return map[cat?.toLowerCase()] || 'purple'
}

export function eventColor(cat: string): string {
  const map: Record<string, string> = {
    idea: '#7c6af7',
    prototype: '#c084fc',
    research: '#38bdf8',
    design: '#c084fc',
    development: '#38bdf8',
    testing: '#f59e0b',
    deployment: '#22d3a0',
    funding: '#f59e0b',
    community: '#22d3a0',
    milestone: '#f59e0b',
    release: '#22d3a0',
    discussion: '#8888aa',
  }
  return map[cat?.toLowerCase()] || '#7c6af7'
}

export function eventEmoji(cat: string): string {
  const map: Record<string, string> = {
    idea: '💡',
    prototype: '🔬',
    research: '📚',
    design: '🎨',
    development: '⚙️',
    testing: '🧪',
    deployment: '🚀',
    funding: '💰',
    community: '👥',
    milestone: '🏆',
    release: '📦',
    discussion: '💬',
  }
  return map[cat?.toLowerCase()] || '📌'
}

export function endorseColor(type: string): string {
  const map: Record<string, string> = {
    brilliant: '#7c6af7',
    helpful: '#22d3a0',
    critical_fix: '#f43f5e',
    excellent_design: '#c084fc',
    research: '#38bdf8',
    mentorship: '#f59e0b',
  }
  return map[type] || '#7c6af7'
}
