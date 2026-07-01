package transactions

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"time"
)

// Validator handles transaction validation for all Dharma Protocol transaction types
type Validator struct{}

// NewValidator creates a new transaction validator
func NewValidator() *Validator {
	return &Validator{}
}

// ValidateCreateProject validates a CREATE_PROJECT transaction
func (v *Validator) ValidateCreateProject(msg *CreateProjectMsg) error {
	if msg.Name == "" {
		return fmt.Errorf("project name is required")
	}
	if len(msg.Name) > 100 {
		return fmt.Errorf("project name exceeds 100 characters")
	}
	if msg.Description == "" {
		return fmt.Errorf("project description is required")
	}
	if len(msg.Description) > 1000 {
		return fmt.Errorf("description exceeds 1000 characters")
	}
	if msg.Sender == "" {
		return fmt.Errorf("sender address is required")
	}
	if msg.Category == "" {
		return fmt.Errorf("project category is required")
	}
	validCategories := map[string]bool{
		CategoryDeFi: true, CategoryNFT: true, CategoryDAO: true,
		CategoryInfra: true, CategorySocial: true, CategoryGaming: true,
		CategoryDeveloper: true, CategoryOther: true,
	}
	if !validCategories[msg.Category] {
		return fmt.Errorf("invalid category: %s", msg.Category)
	}
	return nil
}

// ValidateJoinProject validates a JOIN_PROJECT transaction
func (v *Validator) ValidateJoinProject(msg *JoinProjectMsg) error {
	if msg.ProjectID == "" {
		return fmt.Errorf("project ID is required")
	}
	if msg.Sender == "" {
		return fmt.Errorf("sender address is required")
	}
	return nil
}

// ValidateAddTimelineEvent validates an ADD_TIMELINE_EVENT transaction
func (v *Validator) ValidateAddTimelineEvent(msg *AddTimelineEventMsg) error {
	if msg.ProjectID == "" {
		return fmt.Errorf("project ID is required")
	}
	if msg.Title == "" {
		return fmt.Errorf("event title is required")
	}
	if len(msg.Title) > 200 {
		return fmt.Errorf("event title exceeds 200 characters")
	}
	if msg.Category == "" {
		return fmt.Errorf("event category is required")
	}
	validCategories := map[string]bool{
		EventIdea: true, EventPrototype: true, EventResearch: true,
		EventDesign: true, EventDevelopment: true, EventTesting: true,
		EventDeployment: true, EventFunding: true, EventCommunity: true,
	}
	if !validCategories[msg.Category] {
		return fmt.Errorf("invalid event category: %s", msg.Category)
	}
	return nil
}

// ValidateCreateMilestone validates a CREATE_MILESTONE transaction
func (v *Validator) ValidateCreateMilestone(msg *CreateMilestoneMsg) error {
	if msg.ProjectID == "" {
		return fmt.Errorf("project ID is required")
	}
	if msg.Title == "" {
		return fmt.Errorf("milestone title is required")
	}
	if len(msg.Title) > 200 {
		return fmt.Errorf("milestone title exceeds 200 characters")
	}
	return nil
}

// ValidateEndorseContribution validates an ENDORSE_CONTRIBUTION transaction
func (v *Validator) ValidateEndorseContribution(msg *EndorseContributionMsg) error {
	if msg.ProjectID == "" {
		return fmt.Errorf("project ID is required")
	}
	if msg.TargetAddress == "" {
		return fmt.Errorf("target address is required")
	}
	if msg.Sender == msg.TargetAddress {
		return fmt.Errorf("cannot endorse your own contribution")
	}
	validTypes := map[string]bool{
		EndorseBrilliant: true, EndorseHelpful: true, EndorseCriticalFix: true,
		EndorseDesign: true, EndorseResearch: true, EndorseMentorship: true,
	}
	if !validTypes[msg.EndorsementType] {
		return fmt.Errorf("invalid endorsement type: %s", msg.EndorsementType)
	}
	return nil
}

// ValidateCreateDiscussion validates a CREATE_DISCUSSION transaction
func (v *Validator) ValidateCreateDiscussion(msg *CreateDiscussionMsg) error {
	if msg.ProjectID == "" {
		return fmt.Errorf("project ID is required")
	}
	if msg.Title == "" {
		return fmt.Errorf("discussion title is required")
	}
	if msg.Body == "" {
		return fmt.Errorf("discussion body is required")
	}
	if len(msg.Body) > 5000 {
		return fmt.Errorf("discussion body exceeds 5000 characters")
	}
	return nil
}

// ValidateAddRelease validates an ADD_RELEASE transaction
func (v *Validator) ValidateAddRelease(msg *AddReleaseMsg) error {
	if msg.ProjectID == "" {
		return fmt.Errorf("project ID is required")
	}
	if msg.Version == "" {
		return fmt.Errorf("release version is required")
	}
	if msg.Summary == "" {
		return fmt.Errorf("release summary is required")
	}
	return nil
}

// GenerateTxHash creates a deterministic transaction hash from the message
func GenerateTxHash(msg interface{}) (string, error) {
	data, err := json.Marshal(msg)
	if err != nil {
		return "", fmt.Errorf("failed to marshal message: %w", err)
	}
	// Append timestamp for uniqueness
	data = append(data, []byte(time.Now().String())...)
	hash := sha256.Sum256(data)
	return "0x" + hex.EncodeToString(hash[:]), nil
}

// GenerateProjectID creates a deterministic project ID
func GenerateProjectID(creator, name string, timestamp time.Time) string {
	data := fmt.Sprintf("%s:%s:%d", creator, name, timestamp.UnixNano())
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])[:16]
}

// GenerateEventID creates an event ID for timeline events
func GenerateEventID(projectID, sender string, timestamp time.Time) string {
	data := fmt.Sprintf("%s:%s:%d", projectID, sender, timestamp.UnixNano())
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])[:16]
}
