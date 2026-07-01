// Dharma Protocol – RPC Service
// All frontend ↔ backend communication goes through this module.
// Connects to the Go plugin's JSON-RPC server on port 50002.

import type {
  Project, TimelineEvent, Milestone, Discussion, Release,
  TransactionRecord, TxResult, TX_TYPES,
} from '../types'

const RPC_URL = import.meta.env.VITE_RPC_URL || 'http://localhost:50002/rpc'
let requestId = 1

async function rpc<T>(method: string, params: unknown): Promise<T> {
  const id = requestId++
  const body = JSON.stringify({ jsonrpc: '2.0', method, params, id })

  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

  const data = await res.json()
  if (data.error) throw new Error(data.error.message || 'RPC Error')
  return data.result as T
}

// ─── Transaction Submission ────────────────────────────────────────────────

export async function submitTransaction(
  txType: number,
  payload: unknown,
  sender: string,
): Promise<TxResult> {
  return rpc<TxResult>('dharma_submitTransaction', { tx_type: txType, payload, sender })
}

// ─── Project Operations ────────────────────────────────────────────────────

export async function createProject(
  sender: string,
  data: { name: string; description: string; category: string; repository_url: string },
): Promise<TxResult> {
  const projectId = `proj_${slugify(data.name)}_${Date.now()}`
  return submitTransaction(1001, {
    project_id: projectId,
    name: data.name,
    description: data.description,
    category: data.category,
    repository_url: data.repository_url,
    creator: sender,
    created_at: Math.floor(Date.now() / 1000),
  }, sender)
}

export async function joinProject(sender: string, projectId: string, message: string): Promise<TxResult> {
  return submitTransaction(1002, {
    project_id: projectId,
    contributor: sender,
    message,
    joined_at: Math.floor(Date.now() / 1000),
  }, sender)
}

export async function addTimelineEvent(
  sender: string,
  data: { project_id: string; category: string; title: string; description: string },
): Promise<TxResult> {
  return submitTransaction(1005, {
    project_id: data.project_id,
    contributor: sender,
    category: data.category,
    title: data.title,
    description: data.description,
    timestamp: Math.floor(Date.now() / 1000),
  }, sender)
}

export async function createMilestone(
  sender: string,
  data: { project_id: string; title: string; description: string; due_date?: number },
): Promise<TxResult> {
  return submitTransaction(1006, {
    project_id: data.project_id,
    creator: sender,
    title: data.title,
    description: data.description,
    due_date: data.due_date || 0,
    created_at: Math.floor(Date.now() / 1000),
  }, sender)
}

export async function completeMilestone(
  sender: string,
  data: { project_id: string; milestone_id: string; notes: string },
): Promise<TxResult> {
  return submitTransaction(1007, {
    project_id: data.project_id,
    milestone_id: data.milestone_id,
    completer: sender,
    notes: data.notes,
    completed_at: Math.floor(Date.now() / 1000),
  }, sender)
}

export async function addRelease(
  sender: string,
  data: {
    project_id: string; version: string; summary: string
    release_notes: string; contributors: string[]
  },
): Promise<TxResult> {
  return submitTransaction(1009, {
    project_id: data.project_id,
    publisher: sender,
    version: data.version,
    summary: data.summary,
    release_notes: data.release_notes,
    contributor_count: data.contributors.length,
    contributors: data.contributors,
    published_at: Math.floor(Date.now() / 1000),
  }, sender)
}

export async function endorseContribution(
  sender: string,
  data: { project_id: string; event_id: string; recipient: string; endorse_type: string; note: string },
): Promise<TxResult> {
  return submitTransaction(1010, {
    project_id: data.project_id,
    endorser: sender,
    recipient: data.recipient,
    event_id: data.event_id,
    endorse_type: data.endorse_type,
    note: data.note,
    endorsed_at: Math.floor(Date.now() / 1000),
  }, sender)
}

export async function createDiscussion(
  sender: string,
  data: { project_id: string; title: string; body: string },
): Promise<TxResult> {
  return submitTransaction(1011, {
    project_id: data.project_id,
    creator: sender,
    title: data.title,
    body: data.body,
    created_at: Math.floor(Date.now() / 1000),
  }, sender)
}

export async function resolveDiscussion(
  sender: string,
  data: { project_id: string; discussion_id: string; resolution: string },
): Promise<TxResult> {
  return submitTransaction(1012, {
    project_id: data.project_id,
    discussion_id: data.discussion_id,
    resolver: sender,
    resolution: data.resolution,
    resolved_at: Math.floor(Date.now() / 1000),
  }, sender)
}

// ─── Query Operations ──────────────────────────────────────────────────────

export async function listProjects(opts?: {
  category?: string; creator?: string; limit?: number; offset?: number
}): Promise<{ projects: Project[]; total: number }> {
  return rpc('dharma_listProjects', {
    category: opts?.category || '',
    creator: opts?.creator || '',
    limit: opts?.limit || 20,
    offset: opts?.offset || 0,
  })
}

export async function getProject(projectId: string): Promise<Project> {
  return rpc('dharma_getProject', { project_id: projectId })
}

export async function getTimeline(
  projectId: string,
  opts?: { category?: string; limit?: number },
): Promise<{ events: TimelineEvent[]; total: number }> {
  return rpc('dharma_getTimeline', {
    project_id: projectId,
    category: opts?.category || '',
    limit: opts?.limit || 100,
  })
}

export async function listTransactions(limit = 50): Promise<{
  transactions: TransactionRecord[]; block_height: number
}> {
  return rpc('dharma_listTransactions', { limit })
}

export async function getStats(): Promise<{
  total_projects: number
  total_transactions: number
  total_contributors: number
  block_height: number
}> {
  return rpc('dharma_getStats', {})
}

// ─── Utility ───────────────────────────────────────────────────────────────

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 20)
}

export function shortAddr(addr: string): string {
  if (!addr || addr.length < 12) return addr
  return `${addr.slice(0, 8)}…${addr.slice(-4)}`
}

export function shortHash(hash: string): string {
  if (!hash || hash.length < 12) return hash
  return `${hash.slice(0, 10)}…`
}

export function formatTime(ts: string | undefined): string {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
