package transactions

// Transaction type identifiers for Dharma Protocol custom transactions
const (
	TxTypeCreateProject      = "CREATE_PROJECT"
	TxTypeJoinProject        = "JOIN_PROJECT"
	TxTypeInviteContributor  = "INVITE_CONTRIBUTOR"
	TxTypeAcceptInvitation   = "ACCEPT_INVITATION"
	TxTypeAddTimelineEvent   = "ADD_TIMELINE_EVENT"
	TxTypeCreateMilestone    = "CREATE_MILESTONE"
	TxTypeCompleteMilestone  = "COMPLETE_MILESTONE"
	TxTypeLinkGithubCommit   = "LINK_GITHUB_COMMIT"
	TxTypeAddRelease         = "ADD_RELEASE"
	TxTypeEndorseContribution = "ENDORSE_CONTRIBUTION"
	TxTypeCreateDiscussion   = "CREATE_DISCUSSION"
	TxTypeResolveDiscussion  = "RESOLVE_DISCUSSION"
)

// Timeline event categories
const (
	EventIdea        = "IDEA"
	EventPrototype   = "PROTOTYPE"
	EventResearch    = "RESEARCH"
	EventDesign      = "DESIGN"
	EventDevelopment = "DEVELOPMENT"
	EventTesting     = "TESTING"
	EventDeployment  = "DEPLOYMENT"
	EventFunding     = "FUNDING"
	EventCommunity   = "COMMUNITY_EVENT"
)

// Project categories
const (
	CategoryDeFi        = "DEFI"
	CategoryNFT         = "NFT"
	CategoryDAO         = "DAO"
	CategoryInfra       = "INFRASTRUCTURE"
	CategorySocial      = "SOCIAL"
	CategoryGaming      = "GAMING"
	CategoryDeveloper   = "DEVELOPER_TOOLS"
	CategoryOther       = "OTHER"
)

// Endorsement types
const (
	EndorseBrilliant     = "BRILLIANT"
	EndorseHelpful       = "HELPFUL"
	EndorseCriticalFix   = "CRITICAL_FIX"
	EndorseDesign        = "EXCELLENT_DESIGN"
	EndorseResearch      = "RESEARCH"
	EndorseMentorship    = "MENTORSHIP"
)
