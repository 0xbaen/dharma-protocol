// Dharma Protocol – Frontend Type Definitions

export const TX_TYPES = {
  CREATE_PROJECT: 1001,
  JOIN_PROJECT: 1002,
  INVITE_CONTRIBUTOR: 1003,
  ACCEPT_INVITATION: 1004,
  ADD_TIMELINE_EVENT: 1005,
  CREATE_MILESTONE: 1006,
  COMPLETE_MILESTONE: 1007,
  LINK_GITHUB_COMMIT: 1008,
  ADD_RELEASE: 1009,
  ENDORSE_CONTRIBUTION: 1010,
  CREATE_DISCUSSION: 1011,
  RESOLVE_DISCUSSION: 1012,
} as const

export const TX_NAMES: Record<number, string> = {
  1001: 'CREATE_PROJECT',
  1002: 'JOIN_PROJECT',
  1003: 'INVITE_CONTRIBUTOR',
  1004: 'ACCEPT_INVITATION',
  1005: 'ADD_TIMELINE_EVENT',
  1006: 'CREATE_MILESTONE',
  1007: 'COMPLETE_MILESTONE',
  1008: 'LINK_GITHUB_COMMIT',
  1009: 'ADD_RELEASE',
  1010: 'ENDORSE_CONTRIBUTION',
  1011: 'CREATE_DISCUSSION',
  1012: 'RESOLVE_DISCUSSION',
}

export const EVENT_CATEGORIES = [
  'idea', 'prototype', 'research', 'design',
  'development', 'testing', 'deployment', 'funding', 'community',
] as const

export type EventCategory = typeof EVENT_CATEGORIES[number]

export const PROJECT_CATEGORIES = [
  'defi', 'infrastructure', 'socialfi', 'nft', 'dao', 'tooling', 'research', 'other',
] as const

export type ProjectCategory = typeof PROJECT_CATEGORIES[number]

export const ENDORSE_TYPES = [
  'brilliant', 'helpful', 'critical_fix', 'excellent_design', 'research', 'mentorship',
] as const

export type EndorseType = typeof ENDORSE_TYPES[number]

// ─── Domain Objects ────────────────────────────────────────────────────────

export interface Endorsement {
  id: string
  project_id: string
  endorser: string
  recipient: string
  event_id: string
  type: string
  note: string
  endorsed_at: string
  tx_hash: string
}

export interface TimelineEvent {
  id: string
  project_id: string
  contributor: string
  category: string
  title: string
  description: string
  endorsements: Endorsement[]
  timestamp: string
  tx_hash: string
  block_height: number
}

export interface Milestone {
  id: string
  project_id: string
  creator: string
  title: string
  description: string
  due_date?: string
  completed: boolean
  completer?: string
  notes?: string
  created_at: string
  completed_at?: string
  tx_hash: string
  block_height: number
}

export interface Discussion {
  id: string
  project_id: string
  creator: string
  title: string
  body: string
  resolved: boolean
  resolver?: string
  resolution?: string
  created_at: string
  resolved_at?: string
  tx_hash: string
}

export interface Release {
  id: string
  project_id: string
  publisher: string
  version: string
  summary: string
  release_notes: string
  contributor_count: number
  contributors: string[]
  published_at: string
  tx_hash: string
  block_height: number
}

export interface Contributor {
  address: string
  role: string
  joined_at: string
  event_count: number
  endorsements: number
  tx_hash: string
}

export interface Project {
  id: string
  name: string
  description: string
  category: string
  repository_url: string
  creator: string
  contributors: Contributor[]
  timeline: TimelineEvent[]
  milestones: Milestone[]
  discussions: Discussion[]
  releases: Release[]
  created_at: string
  updated_at: string
  tx_hash: string
  block_height: number
}

export interface TransactionRecord {
  hash: string
  tx_type: number
  tx_type_name: string
  sender: string
  payload: unknown
  block_height: number
  timestamp: string
  fee: number
}

// ─── RPC Types ─────────────────────────────────────────────────────────────

export interface RPCResponse<T> {
  jsonrpc: string
  result?: T
  error?: { code: number; message: string }
  id: number
}

export interface TxResult {
  tx_hash: string
  block_height: number
  timestamp: number
}

// ─── Wallet ────────────────────────────────────────────────────────────────

export interface WalletState {
  connected: boolean
  address: string | null
}
