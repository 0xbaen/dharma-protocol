// Package transactions implements all Dharma Protocol custom transaction types.
// Each transaction type has Validate(), Execute(), and a constructor.
package transactions

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/dharma-protocol/backend/plugin/state"
	"github.com/dharma-protocol/backend/plugin/types"
)

// TxNameMap maps type IDs to human-readable names for the explorer.
var TxNameMap = map[uint64]string{
	types.TxTypeCreateProject:       "CREATE_PROJECT",
	types.TxTypeJoinProject:         "JOIN_PROJECT",
	types.TxTypeInviteContributor:   "INVITE_CONTRIBUTOR",
	types.TxTypeAcceptInvitation:    "ACCEPT_INVITATION",
	types.TxTypeAddTimelineEvent:    "ADD_TIMELINE_EVENT",
	types.TxTypeCreateMilestone:     "CREATE_MILESTONE",
	types.TxTypeCompleteMilestone:   "COMPLETE_MILESTONE",
	types.TxTypeLinkGithubCommit:    "LINK_GITHUB_COMMIT",
	types.TxTypeAddRelease:          "ADD_RELEASE",
	types.TxTypeEndorseContribution: "ENDORSE_CONTRIBUTION",
	types.TxTypeCreateDiscussion:    "CREATE_DISCUSSION",
	types.TxTypeResolveDiscussion:   "RESOLVE_DISCUSSION",
}

// ─── Transaction Processor ───────────────────────────────────────────────────

// Processor routes, validates, and executes Dharma transactions against the state store.
type Processor struct {
	store *state.Store
}

func NewProcessor(store *state.Store) *Processor {
	return &Processor{store: store}
}

// Process validates and applies a transaction to state.
// Returns the transaction hash and any error.
func (p *Processor) Process(
	txType uint64,
	rawPayload json.RawMessage,
	sender string,
	blockHeight uint64,
	timestamp int64,
) (string, error) {
	if err := p.validateSender(sender); err != nil {
		return "", fmt.Errorf("invalid sender: %w", err)
	}

	// Derive deterministic tx hash from content
	txHash := deriveHash(txType, rawPayload, sender, blockHeight)

	var execErr error
	var payloadIface interface{}

	switch txType {
	case types.TxTypeCreateProject:
		var pl types.CreateProjectPayload
		if err := json.Unmarshal(rawPayload, &pl); err != nil {
			return "", fmt.Errorf("unmarshal CreateProject: %w", err)
		}
		if err := validateCreateProject(pl, sender); err != nil {
			return "", err
		}
		if pl.CreatedAt == 0 {
			pl.CreatedAt = timestamp
		}
		execErr = p.store.CreateProject(pl, txHash, blockHeight)
		payloadIface = pl

	case types.TxTypeJoinProject:
		var pl types.JoinProjectPayload
		if err := json.Unmarshal(rawPayload, &pl); err != nil {
			return "", fmt.Errorf("unmarshal JoinProject: %w", err)
		}
		if err := validateJoinProject(pl, sender); err != nil {
			return "", err
		}
		if pl.JoinedAt == 0 {
			pl.JoinedAt = timestamp
		}
		execErr = p.store.JoinProject(pl, txHash, blockHeight)
		payloadIface = pl

	case types.TxTypeAddTimelineEvent:
		var pl types.AddTimelineEventPayload
		if err := json.Unmarshal(rawPayload, &pl); err != nil {
			return "", fmt.Errorf("unmarshal AddTimelineEvent: %w", err)
		}
		if err := validateAddTimelineEvent(pl, sender); err != nil {
			return "", err
		}
		if pl.Timestamp == 0 {
			pl.Timestamp = timestamp
		}
		if pl.EventID == "" {
			pl.EventID = fmt.Sprintf("evt_%s_%d", txHash[:8], blockHeight)
		}
		execErr = p.store.AddTimelineEvent(pl, txHash, blockHeight)
		payloadIface = pl

	case types.TxTypeCreateMilestone:
		var pl types.CreateMilestonePayload
		if err := json.Unmarshal(rawPayload, &pl); err != nil {
			return "", fmt.Errorf("unmarshal CreateMilestone: %w", err)
		}
		if err := validateCreateMilestone(pl, sender); err != nil {
			return "", err
		}
		if pl.CreatedAt == 0 {
			pl.CreatedAt = timestamp
		}
		if pl.MilestoneID == "" {
			pl.MilestoneID = fmt.Sprintf("ms_%s_%d", txHash[:8], blockHeight)
		}
		execErr = p.store.CreateMilestone(pl, txHash, blockHeight)
		payloadIface = pl

	case types.TxTypeCompleteMilestone:
		var pl types.CompleteMilestonePayload
		if err := json.Unmarshal(rawPayload, &pl); err != nil {
			return "", fmt.Errorf("unmarshal CompleteMilestone: %w", err)
		}
		if pl.CompletedAt == 0 {
			pl.CompletedAt = timestamp
		}
		execErr = p.store.CompleteMilestone(pl, txHash, blockHeight)
		payloadIface = pl

	case types.TxTypeAddRelease:
		var pl types.AddReleasePayload
		if err := json.Unmarshal(rawPayload, &pl); err != nil {
			return "", fmt.Errorf("unmarshal AddRelease: %w", err)
		}
		if err := validateAddRelease(pl, sender); err != nil {
			return "", err
		}
		if pl.PublishedAt == 0 {
			pl.PublishedAt = timestamp
		}
		if pl.ReleaseID == "" {
			pl.ReleaseID = fmt.Sprintf("rel_%s_%d", txHash[:8], blockHeight)
		}
		execErr = p.store.AddRelease(pl, txHash, blockHeight)
		payloadIface = pl

	case types.TxTypeEndorseContribution:
		var pl types.EndorseContributionPayload
		if err := json.Unmarshal(rawPayload, &pl); err != nil {
			return "", fmt.Errorf("unmarshal EndorseContribution: %w", err)
		}
		if pl.EndorsedAt == 0 {
			pl.EndorsedAt = timestamp
		}
		if pl.EndorsementID == "" {
			pl.EndorsementID = fmt.Sprintf("end_%s_%d", txHash[:8], blockHeight)
		}
		execErr = p.store.EndorseContribution(pl, txHash, blockHeight)
		payloadIface = pl

	case types.TxTypeCreateDiscussion:
		var pl types.CreateDiscussionPayload
		if err := json.Unmarshal(rawPayload, &pl); err != nil {
			return "", fmt.Errorf("unmarshal CreateDiscussion: %w", err)
		}
		if err := validateCreateDiscussion(pl, sender); err != nil {
			return "", err
		}
		if pl.CreatedAt == 0 {
			pl.CreatedAt = timestamp
		}
		if pl.DiscussionID == "" {
			pl.DiscussionID = fmt.Sprintf("disc_%s_%d", txHash[:8], blockHeight)
		}
		execErr = p.store.CreateDiscussion(pl, txHash, blockHeight)
		payloadIface = pl

	case types.TxTypeResolveDiscussion:
		var pl types.ResolveDiscussionPayload
		if err := json.Unmarshal(rawPayload, &pl); err != nil {
			return "", fmt.Errorf("unmarshal ResolveDiscussion: %w", err)
		}
		if pl.ResolvedAt == 0 {
			pl.ResolvedAt = timestamp
		}
		execErr = p.store.ResolveDiscussion(pl, txHash, blockHeight)
		payloadIface = pl

	default:
		return "", fmt.Errorf("unknown transaction type: %d", txType)
	}

	if execErr != nil {
		return "", fmt.Errorf("execute %s: %w", TxNameMap[txType], execErr)
	}

	// Record in transaction log
	p.store.AppendTransaction(types.TransactionRecord{
		Hash:        txHash,
		TxType:      txType,
		TxTypeName:  TxNameMap[txType],
		Sender:      sender,
		Payload:     payloadIface,
		BlockHeight: blockHeight,
		Timestamp:   time.Unix(timestamp, 0),
	})

	return txHash, nil
}

// ─── Validators ──────────────────────────────────────────────────────────────

func (p *Processor) validateSender(sender string) error {
	if strings.TrimSpace(sender) == "" {
		return fmt.Errorf("sender address required")
	}
	return nil
}

func validateCreateProject(pl types.CreateProjectPayload, sender string) error {
	if strings.TrimSpace(pl.Name) == "" {
		return fmt.Errorf("project name required")
	}
	if strings.TrimSpace(pl.ProjectID) == "" {
		return fmt.Errorf("project_id required")
	}
	if len(pl.Name) > 100 {
		return fmt.Errorf("project name too long (max 100 chars)")
	}
	if len(pl.Description) > 2000 {
		return fmt.Errorf("description too long (max 2000 chars)")
	}
	if pl.Creator != sender {
		return fmt.Errorf("creator must match sender")
	}
	return nil
}

func validateJoinProject(pl types.JoinProjectPayload, sender string) error {
	if strings.TrimSpace(pl.ProjectID) == "" {
		return fmt.Errorf("project_id required")
	}
	if pl.Contributor != sender {
		return fmt.Errorf("contributor must match sender")
	}
	return nil
}

func validateAddTimelineEvent(pl types.AddTimelineEventPayload, sender string) error {
	if strings.TrimSpace(pl.ProjectID) == "" {
		return fmt.Errorf("project_id required")
	}
	if strings.TrimSpace(pl.Title) == "" {
		return fmt.Errorf("event title required")
	}
	if pl.Contributor != sender {
		return fmt.Errorf("contributor must match sender")
	}
	validCategories := map[string]bool{
		types.EventIdea: true, types.EventPrototype: true,
		types.EventResearch: true, types.EventDesign: true,
		types.EventDevelopment: true, types.EventTesting: true,
		types.EventDeployment: true, types.EventFunding: true,
		types.EventCommunity: true,
	}
	if !validCategories[pl.Category] {
		return fmt.Errorf("invalid event category: %s", pl.Category)
	}
	return nil
}

func validateCreateMilestone(pl types.CreateMilestonePayload, sender string) error {
	if strings.TrimSpace(pl.ProjectID) == "" {
		return fmt.Errorf("project_id required")
	}
	if strings.TrimSpace(pl.Title) == "" {
		return fmt.Errorf("milestone title required")
	}
	if pl.Creator != sender {
		return fmt.Errorf("creator must match sender")
	}
	return nil
}

func validateAddRelease(pl types.AddReleasePayload, sender string) error {
	if strings.TrimSpace(pl.ProjectID) == "" {
		return fmt.Errorf("project_id required")
	}
	if strings.TrimSpace(pl.Version) == "" {
		return fmt.Errorf("version required")
	}
	if pl.Publisher != sender {
		return fmt.Errorf("publisher must match sender")
	}
	return nil
}

func validateCreateDiscussion(pl types.CreateDiscussionPayload, sender string) error {
	if strings.TrimSpace(pl.ProjectID) == "" {
		return fmt.Errorf("project_id required")
	}
	if strings.TrimSpace(pl.Title) == "" {
		return fmt.Errorf("discussion title required")
	}
	if pl.Creator != sender {
		return fmt.Errorf("creator must match sender")
	}
	return nil
}

// ─── Hash Utility ────────────────────────────────────────────────────────────

func deriveHash(txType uint64, payload json.RawMessage, sender string, blockHeight uint64) string {
	h := sha256.New()
	h.Write([]byte(fmt.Sprintf("%d:%s:%s:%d:%d",
		txType, string(payload), sender, blockHeight, time.Now().UnixNano())))
	return fmt.Sprintf("%x", h.Sum(nil))
}
