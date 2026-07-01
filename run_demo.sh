#!/usr/bin/env bash
# Dharma Protocol — End-to-End Demo Script
# Run this to simulate all 12 custom transaction types via RPC

set -e

RPC="http://localhost:50002/rpc"
ALICE="cnpy1alice0000000000000000000000000000000000"
BOB="cnpy1bob000000000000000000000000000000000000"
CAROL="cnpy1carol00000000000000000000000000000000000"

call() {
  local method="$1"
  local params="$2"
  echo ""
  echo "→ $method"
  curl -s -X POST "$RPC" \
    -H "Content-Type: application/json" \
    -d "{\"jsonrpc\":\"2.0\",\"method\":\"$method\",\"params\":$params,\"id\":1}" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
  sleep 0.5
}

echo "╔═══════════════════════════════════════════════════╗"
echo "║        DHARMA PROTOCOL — DEMO SCRIPT              ║"
echo "║  The Onchain Memory Layer for Open Collaboration   ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""
echo "RPC endpoint: $RPC"
echo ""

# 1. Check health
echo "── Health Check ──"
curl -s "$RPC/../health" | python3 -m json.tool 2>/dev/null || curl -s http://localhost:50002/health

# 2. Create project (tx 1001)
call "dharma_submitTransaction" "{
  \"tx_type\": 1001,
  \"sender\": \"$ALICE\",
  \"payload\": {
    \"project_id\": \"demo_proj_001\",
    \"name\": \"Demo Project\",
    \"description\": \"A live demo of Dharma Protocol on Canopy Network\",
    \"category\": \"socialfi\",
    \"repository_url\": \"https://github.com/demo/project\",
    \"creator\": \"$ALICE\",
    \"created_at\": $(date +%s)
  }
}"

# 3. Join project (tx 1002)
call "dharma_submitTransaction" "{
  \"tx_type\": 1002,
  \"sender\": \"$BOB\",
  \"payload\": {
    \"project_id\": \"demo_proj_001\",
    \"contributor\": \"$BOB\",
    \"message\": \"Excited to contribute to this demo!\",
    \"joined_at\": $(date +%s)
  }
}"

# 4. Add timeline event (tx 1005)
call "dharma_submitTransaction" "{
  \"tx_type\": 1005,
  \"sender\": \"$ALICE\",
  \"payload\": {
    \"project_id\": \"demo_proj_001\",
    \"contributor\": \"$ALICE\",
    \"category\": \"development\",
    \"title\": \"Backend API completed\",
    \"description\": \"Go plugin with 12 custom tx types deployed to Canopy testnet\",
    \"timestamp\": $(date +%s)
  }
}"

# 5. Create milestone (tx 1006)
call "dharma_submitTransaction" "{
  \"tx_type\": 1006,
  \"sender\": \"$ALICE\",
  \"payload\": {
    \"milestone_id\": \"ms_demo_001\",
    \"project_id\": \"demo_proj_001\",
    \"creator\": \"$ALICE\",
    \"title\": \"MVP Launch\",
    \"description\": \"All features working end-to-end\",
    \"created_at\": $(date +%s)
  }
}"

# 6. Complete milestone (tx 1007)
call "dharma_submitTransaction" "{
  \"tx_type\": 1007,
  \"sender\": \"$ALICE\",
  \"payload\": {
    \"milestone_id\": \"ms_demo_001\",
    \"project_id\": \"demo_proj_001\",
    \"completer\": \"$ALICE\",
    \"notes\": \"All 12 transaction types validated on Canopy\",
    \"completed_at\": $(date +%s)
  }
}"

# 7. Create discussion (tx 1011)
call "dharma_submitTransaction" "{
  \"tx_type\": 1011,
  \"sender\": \"$BOB\",
  \"payload\": {
    \"discussion_id\": \"disc_demo_001\",
    \"project_id\": \"demo_proj_001\",
    \"creator\": \"$BOB\",
    \"title\": \"Should we add token-gating?\",
    \"body\": \"Proposal: require 100 CNPY stake to create projects. Prevents spam.\",
    \"created_at\": $(date +%s)
  }
}"

# 8. Resolve discussion (tx 1012)
call "dharma_submitTransaction" "{
  \"tx_type\": 1012,
  \"sender\": \"$BOB\",
  \"payload\": {
    \"discussion_id\": \"disc_demo_001\",
    \"project_id\": \"demo_proj_001\",
    \"resolver\": \"$BOB\",
    \"resolution\": \"Deferred to post-launch. Keep open for now.\",
    \"resolved_at\": $(date +%s)
  }
}"

# 9. Endorse contribution (tx 1010)
call "dharma_submitTransaction" "{
  \"tx_type\": 1010,
  \"sender\": \"$BOB\",
  \"payload\": {
    \"project_id\": \"demo_proj_001\",
    \"endorser\": \"$BOB\",
    \"recipient\": \"$ALICE\",
    \"event_id\": \"\",
    \"endorse_type\": \"brilliant\",
    \"note\": \"Excellent architecture design!\",
    \"endorsed_at\": $(date +%s)
  }
}"

# 10. Add release (tx 1009)
call "dharma_submitTransaction" "{
  \"tx_type\": 1009,
  \"sender\": \"$ALICE\",
  \"payload\": {
    \"release_id\": \"rel_demo_v1\",
    \"project_id\": \"demo_proj_001\",
    \"publisher\": \"$ALICE\",
    \"version\": \"v1.0.0\",
    \"summary\": \"First release on Canopy Network\",
    \"release_notes\": \"- 12 custom transaction types\\n- React frontend\\n- Blockchain Explorer\\n- Contribution DNA graph\",
    \"contributor_count\": 2,
    \"contributors\": [\"$ALICE\", \"$BOB\"],
    \"published_at\": $(date +%s)
  }
}"

echo ""
echo "── Query: Get Project ──"
call "dharma_getProject" "{\"project_id\": \"demo_proj_001\"}"

echo ""
echo "── Query: List All Transactions ──"
call "dharma_listTransactions" "{\"limit\": 20}"

echo ""
echo "── Query: Network Stats ──"
call "dharma_getStats" "{}"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  Demo complete!                                       ║"
echo "║  Open http://localhost:3000 to see everything        ║"
echo "║  in the Dharma Protocol UI.                          ║"
echo "╚══════════════════════════════════════════════════════╝"
