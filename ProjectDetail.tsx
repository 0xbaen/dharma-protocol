import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import { getProject, shortAddr, shortHash, formatTime, completeMilestone, resolveDiscussion } from '../services/rpc'
import type { Project, TimelineEvent, Milestone, Discussion, Release } from '../types'
import {
  Clock, Target, MessageSquare, Package, Users, GitBranch,
  ExternalLink, CheckCircle2, Circle, ArrowLeft, Plus,
  ThumbsUp, Zap, Hash, Star
} from 'lucide-react'
import { categoryColor, eventColor, eventEmoji } from '../components/colors'
import { ToastContext } from '../App'
import AddTimelineEventModal from '../components/AddTimelineEventModal'
import CreateMilestoneModal from '../components/CreateMilestoneModal'
import CreateDiscussionModal from '../components/CreateDiscussionModal'
import AddReleaseModal from '../components/AddReleaseModal'
import JoinProjectModal from '../components/JoinProjectModal'
import ContributionGraph from '../components/ContributionGraph'

type Tab = 'timeline' | 'milestones' | 'discussions' | 'releases' | 'contributors' | 'dna'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { connected, address } = useWallet()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('timeline')

  // Modals
  const [showTimelineModal, setShowTimelineModal] = useState(false)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [showDiscussionModal, setShowDiscussionModal] = useState(false)
  const [showReleaseModal, setShowReleaseModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)

  const load = async () => {
    if (!id) return
    try {
      const p = await getProject(id)
      setProject(p)
    } catch (e) {
      console.warn('Failed to load project', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const isContributor = project?.contributors?.some(c => c.address === address)
  const isCreator = project?.creator === address

  const reload = () => load()

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', textAlign: 'center', color: '#44445a', paddingTop: 80 }}>
        Loading from Canopy RPC…
      </div>
    )
  }

  if (!project) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', textAlign: 'center', paddingTop: 80 }}>
        <div style={{ color: '#f43f5e', marginBottom: 16 }}>Project not found</div>
        <Link to="/projects" className="btn-secondary" style={{ textDecoration: 'none' }}>← Back to Projects</Link>
      </div>
    )
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'timeline', label: 'Timeline', icon: <Clock size={13} />, count: project.timeline?.length },
    { key: 'milestones', label: 'Milestones', icon: <Target size={13} />, count: project.milestones?.length },
    { key: 'discussions', label: 'Discussions', icon: <MessageSquare size={13} />, count: project.discussions?.length },
    { key: 'releases', label: 'Releases', icon: <Package size={13} />, count: project.releases?.length },
    { key: 'contributors', label: 'Contributors', icon: <Users size={13} />, count: project.contributors?.length },
    { key: 'dna', label: 'DNA', icon: <Star size={13} /> },
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Back */}
      <Link to="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#44445a', textDecoration: 'none', marginBottom: 24 }}>
        <ArrowLeft size={13} /> Projects
      </Link>

      {/* Project Header */}
      <div className="dharma-card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ flex: 1, marginRight: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700 }}>{project.name}</h1>
              <span className={`badge badge-${categoryColor(project.category)}`}>{project.category}</span>
            </div>
            <p style={{ fontSize: 14, color: '#8888aa', lineHeight: 1.6, marginBottom: 16 }}>{project.description}</p>
            <div style={{ display: 'flex', gap: 24, fontSize: 12, color: '#44445a' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={12} /> {project.contributors?.length || 0} contributors
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <GitBranch size={12} /> {project.timeline?.length || 0} events
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={12} /> {formatTime(project.created_at)}
              </span>
              {project.repository_url && (
                <a href={project.repository_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#7c6af7', textDecoration: 'none' }}>
                  <ExternalLink size={12} /> Repository
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          {connected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
              {!isContributor && !isCreator && (
                <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => setShowJoinModal(true)}>
                  <Plus size={13} /> Join Project
                </button>
              )}
              {isContributor && (
                <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => setShowTimelineModal(true)}>
                  <Clock size={13} /> Add Event
                </button>
              )}
              {isCreator && (
                <>
                  <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => setShowMilestoneModal(true)}>
                    <Target size={13} /> Milestone
                  </button>
                  <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => setShowDiscussionModal(true)}>
                    <MessageSquare size={13} /> Discussion
                  </button>
                  <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => setShowReleaseModal(true)}>
                    <Package size={13} /> Release
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Tx info */}
        <div style={{ display: 'flex', gap: 20, paddingTop: 16, borderTop: '1px solid #1e1e30', fontSize: 11 }}>
          <span style={{ color: '#44445a' }}>Creator: <span className="font-mono" style={{ color: '#9d8fff' }}>{shortAddr(project.creator)}</span></span>
          <span style={{ color: '#44445a' }}>Block: <span className="font-mono" style={{ color: '#8888aa' }}>#{project.block_height}</span></span>
          <span style={{ color: '#44445a' }}>Tx: <span className="font-mono" style={{ color: '#8888aa' }}>{shortHash(project.tx_hash)}</span></span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #1e1e30', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', borderRadius: '8px 8px 0 0',
              background: tab === t.key ? '#13131f' : 'transparent',
              border: tab === t.key ? '1px solid #1e1e30' : '1px solid transparent',
              borderBottom: tab === t.key ? '1px solid #13131f' : '1px solid transparent',
              marginBottom: tab === t.key ? -1 : 0,
              color: tab === t.key ? '#9d8fff' : '#44445a',
              fontSize: 13, fontWeight: tab === t.key ? 600 : 400,
              cursor: 'pointer', fontFamily: 'Space Grotesk',
              transition: 'all 0.15s',
            }}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span style={{ background: tab === t.key ? '#7c6af7' : '#1e1e30', color: tab === t.key ? 'white' : '#44445a', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 100 }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'timeline' && <TimelineTab events={project.timeline || []} isContributor={isContributor || isCreator} onAdd={() => setShowTimelineModal(true)} />}
      {tab === 'milestones' && <MilestonesTab milestones={project.milestones || []} projectId={project.id} isCreator={isCreator} address={address} onReload={reload} onAdd={() => setShowMilestoneModal(true)} />}
      {tab === 'discussions' && <DiscussionsTab discussions={project.discussions || []} projectId={project.id} isCreator={isCreator} address={address} onReload={reload} onAdd={() => setShowDiscussionModal(true)} />}
      {tab === 'releases' && <ReleasesTab releases={project.releases || []} onAdd={() => setShowReleaseModal(true)} isCreator={isCreator} />}
      {tab === 'contributors' && <ContributorsTab contributors={project.contributors || []} />}
      {tab === 'dna' && <DNATab project={project} />}

      {/* Modals */}
      {showTimelineModal && <AddTimelineEventModal projectId={project.id} onClose={() => setShowTimelineModal(false)} onSuccess={() => { setShowTimelineModal(false); reload() }} />}
      {showMilestoneModal && <CreateMilestoneModal projectId={project.id} onClose={() => setShowMilestoneModal(false)} onSuccess={() => { setShowMilestoneModal(false); reload() }} />}
      {showDiscussionModal && <CreateDiscussionModal projectId={project.id} onClose={() => setShowDiscussionModal(false)} onSuccess={() => { setShowDiscussionModal(false); reload() }} />}
      {showReleaseModal && <AddReleaseModal projectId={project.id} contributors={project.contributors || []} onClose={() => setShowReleaseModal(false)} onSuccess={() => { setShowReleaseModal(false); reload() }} />}
      {showJoinModal && <JoinProjectModal projectId={project.id} projectName={project.name} onClose={() => setShowJoinModal(false)} onSuccess={() => { setShowJoinModal(false); reload() }} />}
    </div>
  )
}

// ─── Timeline Tab ────────────────────────────────────────────────────────────

function TimelineTab({ events, isContributor, onAdd }: { events: TimelineEvent[], isContributor?: boolean, onAdd: () => void }) {
  return (
    <div>
      {events.length === 0 ? (
        <EmptyTab
          icon={<Clock size={32} color="#2a2a40" />}
          title="No timeline events"
          desc="Be the first to add an event to this project's permanent history."
          action={isContributor ? { label: 'Add Event', onClick: onAdd } : undefined}
        />
      ) : (
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 1, background: 'linear-gradient(to bottom, #7c6af750, #1e1e30 90%)' }} />
          {[...events].reverse().map((evt, i) => (
            <div key={evt.id} style={{ display: 'flex', gap: 20, paddingLeft: 0, marginBottom: 16, position: 'relative' }}>
              {/* Dot */}
              <div style={{ flexShrink: 0, width: 40, display: 'flex', justifyContent: 'center', paddingTop: 14 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: eventColor(evt.category), boxShadow: `0 0 10px ${eventColor(evt.category)}60`, border: '2px solid #13131f', zIndex: 1 }} />
              </div>

              {/* Card */}
              <div className="dharma-card" style={{ padding: 16, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14 }}>{eventEmoji(evt.category)}</span>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{evt.title}</span>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: `${eventColor(evt.category)}20`, color: eventColor(evt.category), fontWeight: 600 }}>
                        {evt.category}
                      </span>
                    </div>
                    {evt.description && <div style={{ fontSize: 13, color: '#8888aa', lineHeight: 1.5 }}>{evt.description}</div>}
                  </div>
                  <div style={{ fontSize: 11, color: '#44445a', whiteSpace: 'nowrap', marginLeft: 16, flexShrink: 0 }}>
                    {formatTime(evt.timestamp)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#44445a', borderTop: '1px solid #1e1e3030', paddingTop: 10, marginTop: 8 }}>
                  <span className="font-mono">{shortAddr(evt.contributor)}</span>
                  <span>block #{evt.block_height}</span>
                  <span className="font-mono" style={{ marginLeft: 'auto' }}>{shortHash(evt.tx_hash)}</span>
                </div>

                {/* Endorsements */}
                {evt.endorsements?.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {evt.endorsements.map(e => (
                      <span key={e.id} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: '#7c6af720', color: '#9d8fff', fontWeight: 600 }}>
                        ✦ {e.type.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Milestones Tab ──────────────────────────────────────────────────────────

function MilestonesTab({ milestones, projectId, isCreator, address, onReload, onAdd }: {
  milestones: Milestone[], projectId: string, isCreator?: boolean, address?: string | null, onReload: () => void, onAdd: () => void
}) {
  const handleComplete = async (m: Milestone) => {
    if (!address) return
    try {
      const res = await completeMilestone(address, { project_id: projectId, milestone_id: m.id, notes: 'Completed!' })
      ToastContext.show({ type: 'success', message: `Milestone completed!`, txHash: res.tx_hash })
      onReload()
    } catch (e: any) {
      ToastContext.show({ type: 'error', message: e.message })
    }
  }

  const done = milestones.filter(m => m.completed).length

  return (
    <div>
      {milestones.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#44445a', marginBottom: 6 }}>
            <span>{done}/{milestones.length} completed</span>
            <span>{milestones.length > 0 ? Math.round((done / milestones.length) * 100) : 0}%</span>
          </div>
          <div style={{ height: 4, background: '#1e1e30', borderRadius: 2 }}>
            <div style={{ height: '100%', borderRadius: 2, width: `${milestones.length > 0 ? (done / milestones.length) * 100 : 0}%`, background: 'linear-gradient(90deg, #7c6af7, #22d3a0)', transition: 'width 0.5s' }} />
          </div>
        </div>
      )}

      {milestones.length === 0 ? (
        <EmptyTab icon={<Target size={32} color="#2a2a40" />} title="No milestones" desc="Create milestones to track project progress on the blockchain."
          action={isCreator ? { label: 'Create Milestone', onClick: onAdd } : undefined} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {milestones.map(m => (
            <div key={m.id} className="dharma-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ marginTop: 2, flexShrink: 0 }}>
                  {m.completed
                    ? <CheckCircle2 size={20} color="#22d3a0" />
                    : <Circle size={20} color="#2a2a40" />
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, textDecoration: m.completed ? 'line-through' : 'none', color: m.completed ? '#44445a' : '#e8e8f4' }}>
                      {m.title}
                    </div>
                    {m.completed && <span style={{ fontSize: 10, background: '#22d3a020', color: '#22d3a0', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>DONE</span>}
                  </div>
                  {m.description && <div style={{ fontSize: 13, color: '#8888aa', marginBottom: 8 }}>{m.description}</div>}
                  {m.notes && m.completed && <div style={{ fontSize: 12, color: '#22d3a0', marginBottom: 8 }}>{m.notes}</div>}
                  <div style={{ fontSize: 11, color: '#44445a' }}>
                    Created {formatTime(m.created_at)}
                    {m.completed_at && ` · Completed ${formatTime(m.completed_at)}`}
                  </div>
                </div>
                {!m.completed && isCreator && (
                  <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px', flexShrink: 0 }} onClick={() => handleComplete(m)}>
                    <CheckCircle2 size={12} /> Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Discussions Tab ─────────────────────────────────────────────────────────

function DiscussionsTab({ discussions, projectId, isCreator, address, onReload, onAdd }: {
  discussions: Discussion[], projectId: string, isCreator?: boolean, address?: string | null, onReload: () => void, onAdd: () => void
}) {
  const handleResolve = async (d: Discussion) => {
    if (!address) return
    try {
      const res = await resolveDiscussion(address, { project_id: projectId, discussion_id: d.id, resolution: 'Resolved.' })
      ToastContext.show({ type: 'success', message: 'Discussion resolved!', txHash: res.tx_hash })
      onReload()
    } catch (e: any) {
      ToastContext.show({ type: 'error', message: e.message })
    }
  }

  return (
    <div>
      {discussions.length === 0 ? (
        <EmptyTab icon={<MessageSquare size={32} color="#2a2a40" />} title="No discussions" desc="Start an onchain discussion about a decision or direction."
          action={isCreator ? { label: 'Start Discussion', onClick: onAdd } : undefined} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {discussions.map(d => (
            <div key={d.id} className="dharma-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <MessageSquare size={14} color={d.resolved ? '#22d3a0' : '#38bdf8'} />
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{d.title}</span>
                    <span style={{ fontSize: 10, background: d.resolved ? '#22d3a020' : '#38bdf820', color: d.resolved ? '#22d3a0' : '#38bdf8', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>
                      {d.resolved ? 'RESOLVED' : 'OPEN'}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#8888aa', lineHeight: 1.5 }}>{d.body}</div>
                </div>
                {!d.resolved && isCreator && (
                  <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px', flexShrink: 0, marginLeft: 16 }} onClick={() => handleResolve(d)}>
                    Resolve
                  </button>
                )}
              </div>
              {d.resolved && d.resolution && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: '#22d3a010', border: '1px solid #22d3a030', borderRadius: 8, fontSize: 12, color: '#22d3a0' }}>
                  ✓ {d.resolution}
                </div>
              )}
              <div style={{ fontSize: 11, color: '#44445a', marginTop: 10, borderTop: '1px solid #1e1e3030', paddingTop: 10 }}>
                <span className="font-mono">{shortAddr(d.creator)}</span> · {formatTime(d.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Releases Tab ────────────────────────────────────────────────────────────

function ReleasesTab({ releases, isCreator, onAdd }: { releases: Release[], isCreator?: boolean, onAdd: () => void }) {
  return (
    <div>
      {releases.length === 0 ? (
        <EmptyTab icon={<Package size={32} color="#2a2a40" />} title="No releases" desc="Publish releases to record project versions permanently on Canopy."
          action={isCreator ? { label: 'Publish Release', onClick: onAdd } : undefined} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...releases].reverse().map(r => (
            <div key={r.id} className="dharma-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <Package size={16} color="#22d3a0" />
                    <span className="font-display" style={{ fontWeight: 700, fontSize: 16, color: '#22d3a0' }}>{r.version}</span>
                    <span style={{ fontSize: 12, color: '#8888aa' }}>{r.summary}</span>
                  </div>
                  <pre style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#8888aa', whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }}>
                    {r.release_notes}
                  </pre>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#44445a', borderTop: '1px solid #1e1e3030', paddingTop: 10 }}>
                <span><Users size={10} style={{ display: 'inline', marginRight: 4 }} />{r.contributor_count} contributors</span>
                <span>{formatTime(r.published_at)}</span>
                <span className="font-mono" style={{ marginLeft: 'auto' }}>{shortHash(r.tx_hash)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Contributors Tab ────────────────────────────────────────────────────────

function ContributorsTab({ contributors }: { contributors: any[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
      {contributors.map(c => (
        <div key={c.address} className="dharma-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: c.role === 'creator' ? 'linear-gradient(135deg, #7c6af7, #c084fc)' : 'linear-gradient(135deg, #22d3a0, #38bdf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: 'white',
            }}>
              {c.address.slice(5, 6).toUpperCase()}
            </div>
            <div>
              <div className="font-mono" style={{ fontSize: 12, color: '#9d8fff' }}>{shortAddr(c.address)}</div>
              <div style={{ fontSize: 11, color: '#44445a', marginTop: 2 }}>{c.role}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#44445a' }}>
            <span><Zap size={10} style={{ display: 'inline', marginRight: 4 }} />{c.event_count || 0} events</span>
            <span><ThumbsUp size={10} style={{ display: 'inline', marginRight: 4 }} />{c.endorsements || 0} endorsements</span>
          </div>
          <div style={{ fontSize: 11, color: '#2a2a40', marginTop: 6 }}>
            Joined {formatTime(c.joined_at)}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── DNA Tab ─────────────────────────────────────────────────────────────────

function DNATab({ project }: { project: Project }) {
  const completedMilestones = project.milestones?.filter(m => m.completed).length || 0
  const openDiscussions = project.discussions?.filter(d => !d.resolved).length || 0
  const latestRelease = project.releases?.slice(-1)[0]

  const age = Math.floor((Date.now() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {/* Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="font-display" style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Project DNA</div>
        {[
          { label: 'Project Age', value: `${age} days`, color: '#7c6af7' },
          { label: 'Contributors', value: project.contributors?.length || 0, color: '#22d3a0' },
          { label: 'Timeline Events', value: project.timeline?.length || 0, color: '#c084fc' },
          { label: 'Milestones Completed', value: `${completedMilestones}/${project.milestones?.length || 0}`, color: '#f59e0b' },
          { label: 'Open Discussions', value: openDiscussions, color: '#38bdf8' },
          { label: 'Releases', value: project.releases?.length || 0, color: '#22d3a0' },
          { label: 'Latest Release', value: latestRelease?.version || 'None', color: '#22d3a0' },
          { label: 'Block Height', value: `#${project.block_height}`, color: '#44445a' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0a0a12', borderRadius: 8, border: '1px solid #1e1e30' }}>
            <span style={{ fontSize: 12, color: '#8888aa' }}>{label}</span>
            <span style={{ fontWeight: 700, color, fontSize: 13 }}>{value}</span>
          </div>
        ))}

        {/* Tx info */}
        <div style={{ padding: '10px 14px', background: '#0a0a12', borderRadius: 8, border: '1px solid #1e1e30' }}>
          <div style={{ fontSize: 11, color: '#44445a', marginBottom: 4 }}>ORIGIN TRANSACTION</div>
          <div className="font-mono" style={{ fontSize: 11, color: '#7c6af7', wordBreak: 'break-all' }}>{project.tx_hash}</div>
        </div>
      </div>

      {/* Contribution Graph */}
      <ContributionGraph contributors={project.contributors || []} projectName={project.name} />
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyTab({ icon, title, desc, action }: { icon: React.ReactNode, title: string, desc: string, action?: { label: string, onClick: () => void } }) {
  return (
    <div className="dharma-card" style={{ padding: 60, textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#44445a', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>{desc}</div>
      {action && (
        <button className="btn-primary" onClick={action.onClick}>
          <Plus size={14} /> {action.label}
        </button>
      )}
    </div>
  )
}
