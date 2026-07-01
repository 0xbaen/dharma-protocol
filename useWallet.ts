import { useState, useCallback, createContext, useContext } from 'react'
import type { WalletState } from '../types'

interface WalletContextType extends WalletState {
  connect: (address?: string) => void
  disconnect: () => void
}

export const WalletContext = createContext<WalletContextType>({
  connected: false,
  address: null,
  connect: () => {},
  disconnect: () => {},
})

export function useWallet() {
  return useContext(WalletContext)
}

// Generate a deterministic-looking Canopy address from a seed
function generateAddress(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash |= 0
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0')
  return `cnpy1${hex}0000000000000000000000000000000000`
}

export function useWalletState(): WalletContextType {
  const [state, setState] = useState<WalletState>(() => {
    const stored = localStorage.getItem('dharma_wallet')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return { connected: false, address: null }
      }
    }
    return { connected: false, address: null }
  })

  const connect = useCallback((address?: string) => {
    const addr = address || generateAddress(Date.now().toString())
    const next = { connected: true, address: addr }
    setState(next)
    localStorage.setItem('dharma_wallet', JSON.stringify(next))
  }, [])

  const disconnect = useCallback(() => {
    const next = { connected: false, address: null }
    setState(next)
    localStorage.removeItem('dharma_wallet')
  }, [])

  return { ...state, connect, disconnect }
}
