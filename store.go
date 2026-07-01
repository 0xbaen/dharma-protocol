// Package state manages the persistent state of the Dharma Protocol plugin.
// All state is derived from and verified against the Canopy blockchain.
package state

import (
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/dharma-protocol/backend/plugin/types"
)

// Store is the in-memory state store for Dharma Protocol.
// It is rebuilt from blockchain events on node startup and updated
// with each new block that contains Dharma transactions.
type Store struct {
	mu           sync.RWMutex
	projects     map[string]*types.Project
	transactions []types.TransactionRecord
	blockHeight  uint64
}

// NewStore creates a fresh store instance.
func NewStore() *Store {
	return &Store{
		projects:     make(map[string]*types.Project),
		transactions: make([]types.TransactionRecord, 0),
	}
}

// ─── Project Methods ─────────────────────────────────────────────────────────

func (s *Store) CreateProject(payload types.CreateProjectPayload, txHash string, blockHeight uint64) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.projects[payload.ProjectID]; exists {
		return fmt.Errorf("project %s already exists", payload.ProjectID)
	}

	now := time.Unix(payload.CreatedAt, 0)
	project := &types.Project{
		ID:            payload.ProjectID,
		Name:          payload.Name,
		Description:   payload.Description,
		Category:      payload.Category,
		RepositoryURL: payload.RepositoryURL,
		Creator:       payload.Creator,
		Contributors: []types.Contributor{
			{
				Address:  payload.Creator,
				Role:     "creator",
				JoinedAt: now,
				TxHash:   txHash,
			},
		},
		Timeline:    make([]types.TimelineEvent, 0),
		Milestones:  make([]types.Milestone, 0),
		Discussions: make([]types.Discussion, 0),
		Releases:    make([]types.Release, 0),
		CreatedAt:   now,
		UpdatedAt:   now,
		TxHash:      txHash,
		BlockHeight: blockHeight,
	}

	// Auto-add creation event to timeline
	project.Timeline = append(project.Timeline, types.TimelineEvent{
		ID:          fmt.Sprintf("evt_%s_created", payload.ProjectID),
		ProjectID:   payload.ProjectID,
		Contributor: payload.Creator,
		Category:    types.EventIdea,
		Title:       "Project Created",
		Description: fmt.Sprintf("%s was created on Dharma Protocol", payload.Name),
		Endorsements: []types.Endorsement{},
		Timestamp:   now,
		TxHash:      txHash,
		BlockHeight: blockHeight,
	})

	s.projects[payload.ProjectID] = project
	return nil
}

func (s *Store) JoinProject(payload types.JoinProjectPayload, txHash string, blockHeight uint64) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	project, err := s.getProject(payload.ProjectID)
	if err != nil {
		return err
	}

	// Check not already a contributor
	for _, c := range project.Contributors {
		if c.Address == payload.Contributor {
			return fmt.Errorf("address %s already a contributor", payload.Contributor)
		}
	}

	now := time.Unix(payload.JoinedAt, 0)
	project.Contributors = append(project.Contributors, types.Contributor{
		Address:  payload.Contributor,
		Role:     "contributor",
		JoinedAt: now,
		TxHash:   txHash,
	})

	project.Timeline = append(project.Timeline, types.TimelineEvent{
		ID:          fmt.Sprintf("evt_%s_joined_%d", payload.Contributor[:8], blockHeight),
		ProjectID:   payload.ProjectID,
		Contributor: payload.Contributor,
		Category:    types.EventCommunity,
		Title:       "New Contributor Joined",
		Description: payload.Message,
		Endorsements: []types.Endorsement{},
		Timestamp:   now,
		TxHash:      txHash,
		BlockHeight: blockHeight,
	})

	project.UpdatedAt = now
	return nil
}

func (s *Store) AddTimelineEvent(payload types.AddTimelineEventPayload, txHash string, blockHeight uint64) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	project, err := s.getProject(payload.ProjectID)
	if err != nil {
		return err
	}

	ts := time.Unix(payload.Timestamp, 0)
	event := types.TimelineEvent{
		ID:          payload.EventID,
		ProjectID:   payload.ProjectID,
		Contributor: payload.Contributor,
		Category:    payload.Category,
		Title:       payload.Title,
		Description: payload.Description,
		Endorsements: []types.Endorsement{},
		Timestamp:   ts,
		TxHash:      txHash,
		BlockHeight: blockHeight,
	}

	project.Timeline = append(project.Timeline, event)

	// Increment contributor event count
	for i, c := range project.Contributors {
		if c.Address == payload.Contributor {
			project.Contributors[i].EventCount++
			break
		}
	}

	project.UpdatedAt = ts
	return nil
}

func (s *Store) CreateMilestone(payload types.CreateMilestonePayload, txHash string, blockHeight uint64) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	project, err := s.getProject(payload.ProjectID)
	if err != nil {
		return err
	}

	now := time.Unix(payload.CreatedAt, 0)
	var dueDate *time.Time
	if payload.DueDate > 0 {
		t := time.Unix(payload.DueDate, 0)
		dueDate = &t
	}

	milestone := types.Milestone{
		ID:          payload.MilestoneID,
		ProjectID:   payload.ProjectID,
		Creator:     payload.Creator,
		Title:       payload.Title,
		Description: payload.Description,
		DueDate:     dueDate,
		Completed:   false,
		CreatedAt:   now,
		TxHash:      txHash,
		BlockHeight: blockHeight,
	}

	project.Milestones = append(project.Milestones, milestone)
	project.UpdatedAt = now
	return nil
}

func (s *Store) CompleteMilestone(payload types.CompleteMilestonePayload, txHash string, blockHeight uint64) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	project, err := s.getProject(payload.ProjectID)
	if err != nil {
		return err
	}

	now := time.Unix(payload.CompletedAt, 0)
	found := false
	for i, m := range project.Milestones {
		if m.ID == payload.MilestoneID {
			project.Milestones[i].Completed = true
			project.Milestones[i].Completer = payload.Completer
			project.Milestones[i].Notes = payload.Notes
			project.Milestones[i].CompletedAt = &now
			found = true
			break
		}
	}
	if !found {
		return fmt.Errorf("milestone %s not found in project %s", payload.MilestoneID, payload.ProjectID)
	}

	// Auto-add timeline event for milestone completion
	project.Timeline = append(project.Timeline, types.TimelineEvent{
		ID:          fmt.Sprintf("evt_milestone_%s_completed", payload.MilestoneID),
		ProjectID:   payload.ProjectID,
		Contributor: payload.Completer,
		Category:    types.EventMilestone,
		Title:       "Milestone Completed",
		Description: payload.Notes,
		Endorsements: []types.Endorsement{},
		Timestamp:   now,
		TxHash:      txHash,
		BlockHeight: blockHeight,
	})

	project.UpdatedAt = now
	return nil
}

func (s *Store) AddRelease(payload types.AddReleasePayload, txHash string, blockHeight uint64) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	project, err := s.getProject(payload.ProjectID)
	if err != nil {
		return err
	}

	now := time.Unix(payload.PublishedAt, 0)
	release := types.Release{
		ID:               payload.ReleaseID,
		ProjectID:        payload.ProjectID,
		Publisher:        payload.Publisher,
		Version:          payload.Version,
		Summary:          payload.Summary,
		ReleaseNotes:     payload.ReleaseNotes,
		ContributorCount: payload.ContributorCount,
		Contributors:     payload.Contributors,
		PublishedAt:      now,
		TxHash:           txHash,
		BlockHeight:      blockHeight,
	}

	project.Releases = append(project.Releases, release)

	// Auto-add timeline event for release
	project.Timeline = append(project.Timeline, types.TimelineEvent{
		ID:          fmt.Sprintf("evt_release_%s", payload.ReleaseID),
		ProjectID:   payload.ProjectID,
		Contributor: payload.Publisher,
		Category:    types.EventRelease,
		Title:       fmt.Sprintf("Release %s Published", payload.Version),
		Description: payload.Summary,
		Endorsements: []types.Endorsement{},
		Timestamp:   now,
		TxHash:      txHash,
		BlockHeight: blockHeight,
	})

	project.UpdatedAt = now
	return nil
}

func (s *Store) EndorseContribution(payload types.EndorseContributionPayload, txHash string, blockHeight uint64) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	project, err := s.getProject(payload.ProjectID)
	if err != nil {
		return err
	}

	now := time.Unix(payload.EndorsedAt, 0)
	endorsement := types.Endorsement{
		ID:         payload.EndorsementID,
		ProjectID:  payload.ProjectID,
		Endorser:   payload.Endorser,
		Recipient:  payload.Recipient,
		EventID:    payload.EventID,
		Type:       payload.EndorseType,
		Note:       payload.Note,
		EndorsedAt: now,
		TxHash:     txHash,
	}

	// Attach endorsement to timeline event
	for i, evt := range project.Timeline {
		if evt.ID == payload.EventID {
			project.Timeline[i].Endorsements = append(project.Timeline[i].Endorsements, endorsement)
			break
		}
	}

	// Increment recipient endorsement count
	for i, c := range project.Contributors {
		if c.Address == payload.Recipient {
			project.Contributors[i].Endorsements++
			break
		}
	}

	project.UpdatedAt = now
	return nil
}

func (s *Store) CreateDiscussion(payload types.CreateDiscussionPayload, txHash string, blockHeight uint64) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	project, err := s.getProject(payload.ProjectID)
	if err != nil {
		return err
	}

	now := time.Unix(payload.CreatedAt, 0)
	discussion := types.Discussion{
		ID:        payload.DiscussionID,
		ProjectID: payload.ProjectID,
		Creator:   payload.Creator,
		Title:     payload.Title,
		Body:      payload.Body,
		Resolved:  false,
		CreatedAt: now,
		TxHash:    txHash,
	}

	project.Discussions = append(project.Discussions, discussion)

	// Auto-add timeline event
	project.Timeline = append(project.Timeline, types.TimelineEvent{
		ID:          fmt.Sprintf("evt_discussion_%s", payload.DiscussionID),
		ProjectID:   payload.ProjectID,
		Contributor: payload.Creator,
		Category:    types.EventDiscussion,
		Title:       fmt.Sprintf("Discussion: %s", payload.Title),
		Description: payload.Body,
		Endorsements: []types.Endorsement{},
		Timestamp:   now,
		TxHash:      txHash,
		BlockHeight: blockHeight,
	})

	project.UpdatedAt = now
	return nil
}

func (s *Store) ResolveDiscussion(payload types.ResolveDiscussionPayload, txHash string, blockHeight uint64) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	project, err := s.getProject(payload.ProjectID)
	if err != nil {
		return err
	}

	now := time.Unix(payload.ResolvedAt, 0)
	found := false
	for i, d := range project.Discussions {
		if d.ID == payload.DiscussionID {
			project.Discussions[i].Resolved = true
			project.Discussions[i].Resolver = payload.Resolver
			project.Discussions[i].Resolution = payload.Resolution
			project.Discussions[i].ResolvedAt = &now
			found = true
			break
		}
	}
	if !found {
		return fmt.Errorf("discussion %s not found", payload.DiscussionID)
	}

	project.UpdatedAt = now
	return nil
}

// ─── Query Methods ───────────────────────────────────────────────────────────

func (s *Store) GetProject(id string) (*types.Project, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.getProject(id)
}

func (s *Store) getProject(id string) (*types.Project, error) {
	p, ok := s.projects[id]
	if !ok {
		return nil, fmt.Errorf("project %s not found", id)
	}
	return p, nil
}

func (s *Store) ListProjects(category, creator string, limit, offset int) ([]*types.Project, int) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]*types.Project, 0)
	for _, p := range s.projects {
		if category != "" && p.Category != category {
			continue
		}
		if creator != "" && p.Creator != creator {
			continue
		}
		result = append(result, p)
	}

	total := len(result)
	if offset >= total {
		return []*types.Project{}, total
	}
	end := offset + limit
	if limit == 0 || end > total {
		end = total
	}
	return result[offset:end], total
}

// ─── Transaction Log ─────────────────────────────────────────────────────────

func (s *Store) AppendTransaction(tx types.TransactionRecord) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.transactions = append([]types.TransactionRecord{tx}, s.transactions...) // newest first
}

func (s *Store) ListTransactions(limit int) []types.TransactionRecord {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if limit == 0 || limit > len(s.transactions) {
		limit = len(s.transactions)
	}
	out := make([]types.TransactionRecord, limit)
	copy(out, s.transactions[:limit])
	return out
}

func (s *Store) SetBlockHeight(h uint64) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.blockHeight = h
}

func (s *Store) GetBlockHeight() uint64 {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.blockHeight
}

// MarshalJSON for debug/export
func (s *Store) MarshalJSON() ([]byte, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	type export struct {
		Projects    map[string]*types.Project `json:"projects"`
		Transactions []types.TransactionRecord `json:"transactions"`
		BlockHeight uint64                    `json:"block_height"`
	}

	return json.Marshal(export{
		Projects:    s.projects,
		Transactions: s.transactions,
		BlockHeight: s.blockHeight,
	})
}
