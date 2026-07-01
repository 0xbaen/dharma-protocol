package transactions

import "time"

// Base transaction message embedded in all Dharma transactions
type BaseTxMsg struct {
	TxType    string    `json:"tx_type"`
	Sender    string    `json:"sender"`
	Timestamp time.Time `json:"timestamp"`
	Nonce     uint64    `json:"nonce"`
}

// CreateProjectMsg creates a new collaborative project on Dharma Protocol
type CreateProjectMsg struct {
	BaseTxMsg
	ProjectID     string `json:"project_id"`
	Name          string `json:"name"`
	Description   string `json:"description"`
	Category      string `json:"category"`
	RepositoryURL string `json:"repository_url"`
	Creator       string `json:"creator"`
}

// JoinProjectMsg represents a user requesting to join a project
type JoinProjectMsg struct {
	BaseTxMsg
	ProjectID string `json:"project_id"`
	Message   string `json:"message"`
}

// InviteContributorMsg invites a wallet address to join a project
type InviteContributorMsg struct {
	BaseTxMsg
	ProjectID        string `json:"project_id"`
	InviteeAddress   string `json:"invitee_address"`
	Role             string `json:"role"`
	Message          string `json:"message"`
}

// AcceptInvitationMsg accepts a project invitation
type AcceptInvitationMsg struct {
	BaseTxMsg
	ProjectID      string `json:"project_id"`
	InviterAddress string `json:"inviter_address"`
}

// AddTimelineEventMsg adds an event to a project's onchain timeline
type AddTimelineEventMsg struct {
	BaseTxMsg
	ProjectID   string `json:"project_id"`
	EventID     string `json:"event_id"`
	Category    string `json:"category"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Attachments []string `json:"attachments,omitempty"`
}

// CreateMilestoneMsg creates a milestone for a project
type CreateMilestoneMsg struct {
	BaseTxMsg
	ProjectID   string    `json:"project_id"`
	MilestoneID string    `json:"milestone_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	DueDate     time.Time `json:"due_date,omitempty"`
}

// CompleteMilestoneMsg marks a milestone as complete
type CompleteMilestoneMsg struct {
	BaseTxMsg
	ProjectID   string `json:"project_id"`
	MilestoneID string `json:"milestone_id"`
	Summary     string `json:"summary"`
}

// LinkGithubCommitMsg links a GitHub commit hash to a project's timeline
type LinkGithubCommitMsg struct {
	BaseTxMsg
	ProjectID  string `json:"project_id"`
	CommitHash string `json:"commit_hash"`
	RepoURL    string `json:"repo_url"`
	Message    string `json:"message"`
}

// AddReleaseMsg records a new release on the Canopy blockchain
type AddReleaseMsg struct {
	BaseTxMsg
	ProjectID        string   `json:"project_id"`
	ReleaseID        string   `json:"release_id"`
	Version          string   `json:"version"`
	Summary          string   `json:"summary"`
	ReleaseNotes     string   `json:"release_notes"`
	ContributorCount int      `json:"contributor_count"`
	Contributors     []string `json:"contributors"`
}

// EndorseContributionMsg endorses a contributor's work on a project
type EndorseContributionMsg struct {
	BaseTxMsg
	ProjectID      string `json:"project_id"`
	TargetAddress  string `json:"target_address"`
	EndorsementType string `json:"endorsement_type"`
	EventID        string `json:"event_id,omitempty"`
	Note           string `json:"note,omitempty"`
}

// CreateDiscussionMsg opens a new discussion on a project
type CreateDiscussionMsg struct {
	BaseTxMsg
	ProjectID    string `json:"project_id"`
	DiscussionID string `json:"discussion_id"`
	Title        string `json:"title"`
	Body         string `json:"body"`
}

// ResolveDiscussionMsg closes and resolves a project discussion
type ResolveDiscussionMsg struct {
	BaseTxMsg
	ProjectID    string `json:"project_id"`
	DiscussionID string `json:"discussion_id"`
	Resolution   string `json:"resolution"`
	Outcome      string `json:"outcome"` // ACCEPTED, REJECTED, DEFERRED
}
