// Dharma Protocol - Canopy Network Plugin
// The Onchain Memory Layer for Open Collaboration
package main

import (
	"encoding/json"
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/dharma-protocol/backend/plugin/rpc"
	"github.com/dharma-protocol/backend/plugin/state"
	"github.com/dharma-protocol/backend/plugin/transactions"
	"github.com/dharma-protocol/backend/plugin/types"
)

func main() {
	var (
		rpcAddr   = flag.String("rpc", ":50002", "JSON-RPC listen address")
		adminAddr = flag.String("admin", ":50003", "Admin RPC listen address")
		seed      = flag.Bool("seed", false, "Seed demo data on startup")
		export    = flag.String("export", "", "Export state JSON path on shutdown")
	)
	flag.Parse()

	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("╔══════════════════════════════════════════╗")
	log.Println("║       DHARMA PROTOCOL - CANOPY NODE      ║")
	log.Println("║   The Onchain Memory Layer for OpenSrc   ║")
	log.Println("╚══════════════════════════════════════════╝")

	store := state.NewStore()

	if *seed {
		log.Println("[dharma] Seeding demo data...")
		seedDemoData(store)
	}

	go func() {
		if err := rpc.NewServer(store).Start(*rpcAddr); err != nil {
			log.Fatalf("[dharma] RPC error: %v", err)
		}
	}()
	go func() {
		if err := rpc.NewServer(store).Start(*adminAddr); err != nil {
			log.Fatalf("[dharma] Admin RPC error: %v", err)
		}
	}()

	log.Printf("[dharma] Primary RPC  → %s", *rpcAddr)
	log.Printf("[dharma] Admin RPC    → %s", *adminAddr)
	log.Println("[dharma] Custom tx types: CREATE_PROJECT(1001) ... RESOLVE_DISCUSSION(1012)")
	log.Println("[dharma] Ready")

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	if *export != "" {
		data, _ := json.MarshalIndent(store, "", "  ")
		os.WriteFile(*export, data, 0644)
		log.Printf("[dharma] State exported to %s", *export)
	}
	log.Println("[dharma] Shutdown complete.")
}

func seedDemoData(store *state.Store) {
	proc := transactions.NewProcessor(store)
	apply := func(txType uint64, sender string, payload interface{}) {
		raw, _ := json.Marshal(payload)
		h := store.GetBlockHeight() + 1
		store.SetBlockHeight(h)
		hash, err := proc.Process(txType, raw, sender, h, time.Now().Unix())
		if err != nil {
			log.Printf("[seed] tx %d error: %v", txType, err)
			return
		}
		log.Printf("[seed] %s block=%d hash=%s", transactions.TxNameMap[txType], h, hash[:12])
	}

	alice := "cnpy1alice000000000000000000000000000000"
	bob   := "cnpy1bob00000000000000000000000000000000"
	carol := "cnpy1carol00000000000000000000000000000"

	apply(types.TxTypeCreateProject, alice, types.CreateProjectPayload{
		ProjectID: "proj_dharma_001", Name: "Dharma Protocol",
		Description: "The onchain memory layer for open collaboration.", Category: types.CategorySocialFi,
		RepositoryURL: "https://github.com/dharma-protocol/dharma", Creator: alice, CreatedAt: 1700000000,
	})
	apply(types.TxTypeJoinProject, bob, types.JoinProjectPayload{
		ProjectID: "proj_dharma_001", Contributor: bob, Message: "Excited to build!", JoinedAt: 1700003600,
	})
	apply(types.TxTypeJoinProject, carol, types.JoinProjectPayload{
		ProjectID: "proj_dharma_001", Contributor: carol, Message: "Here for design and docs.", JoinedAt: 1700005000,
	})
	apply(types.TxTypeAddTimelineEvent, alice, types.AddTimelineEventPayload{
		ProjectID: "proj_dharma_001", Contributor: alice, Category: types.EventPrototype,
		Title: "Go Plugin Architecture Designed", Timestamp: 1700007200,
		Description: "Core plugin with 12 custom tx types on Canopy Go Template.",
	})
	apply(types.TxTypeAddTimelineEvent, bob, types.AddTimelineEventPayload{
		ProjectID: "proj_dharma_001", Contributor: bob, Category: types.EventDesign,
		Title: "React Design System Built", Timestamp: 1700010800,
		Description: "Dark theme, TailwindCSS, shadcn/ui, timeline animations.",
	})
	apply(types.TxTypeCreateMilestone, alice, types.CreateMilestonePayload{
		MilestoneID: "ms_dharma_mvp", ProjectID: "proj_dharma_001", Creator: alice,
		Title: "MVP Launch on Canopy Testnet", Description: "All 12 tx types functional.", CreatedAt: 1700014400,
	})
	apply(types.TxTypeCompleteMilestone, alice, types.CompleteMilestonePayload{
		MilestoneID: "ms_dharma_mvp", ProjectID: "proj_dharma_001", Completer: alice,
		Notes: "MVP live. All 12 tx types validated on testnet.", CompletedAt: 1700021600,
	})
	apply(types.TxTypeCreateDiscussion, bob, types.CreateDiscussionPayload{
		DiscussionID: "disc_dharma_001", ProjectID: "proj_dharma_001", Creator: bob,
		Title: "Token-gated project creation?", Body: "Should we require CNPY stake? Prevents spam.", CreatedAt: 1700023000,
	})
	apply(types.TxTypeResolveDiscussion, bob, types.ResolveDiscussionPayload{
		DiscussionID: "disc_dharma_001", ProjectID: "proj_dharma_001", Resolver: bob,
		Resolution: "Keep open for now. Revisit post-launch.", ResolvedAt: 1700024000,
	})
	apply(types.TxTypeAddRelease, alice, types.AddReleasePayload{
		ReleaseID: "rel_dharma_v01", ProjectID: "proj_dharma_001", Publisher: alice,
		Version: "v0.1.0", Summary: "Initial release on Canopy Network",
		ReleaseNotes: "12 custom tx types, RPC server, React frontend, blockchain explorer",
		ContributorCount: 3, Contributors: []string{alice, bob, carol}, PublishedAt: 1700025200,
	})

	apply(types.TxTypeCreateProject, bob, types.CreateProjectPayload{
		ProjectID: "proj_civicchain_002", Name: "CivicChain",
		Description: "Community governance on Canopy Network.", Category: types.CategoryDAO,
		RepositoryURL: "https://github.com/civicchain/core", Creator: bob, CreatedAt: 1699900000,
	})
	apply(types.TxTypeAddTimelineEvent, bob, types.AddTimelineEventPayload{
		ProjectID: "proj_civicchain_002", Contributor: bob, Category: types.EventDevelopment,
		Title: "Python gRPC Plugin Completed", Timestamp: 1699950000,
		Description: "Canopy plugin with Python/gRPC, protobuf tx types, FastAPI server.",
	})

	log.Println("[seed] Done: 2 projects with full history")
}
