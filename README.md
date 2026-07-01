# Dharma Protocol

> **The Onchain Memory Layer for Open Collaboration**

Dharma Protocol permanently preserves the complete social history of collaborative projects on the **Canopy Network**. Every contribution, milestone, discussion, and release becomes an immutable onchain event.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  React Frontend                      │
│         (Vite · TypeScript · TailwindCSS)           │
│                                                     │
│   Landing → Dashboard → Projects → Explorer         │
│   ProjectDetail (Timeline · Milestones · DNA…)     │
└─────────────────────┬───────────────────────────────┘
                      │ JSON-RPC (POST /rpc)
                      │ port 50002
┌─────────────────────▼───────────────────────────────┐
│              Go Backend Plugin                       │
│                                                     │
│   RPC Server  →  Processor  →  State Store          │
│                                                     │
│   12 Custom Transaction Types (1001–1012)           │
│   Canopy Network Go Template                        │
└─────────────────────────────────────────────────────┘
```

---

## Custom Transaction Types

| ID   | Type                  | Description                              |
|------|-----------------------|------------------------------------------|
| 1001 | `CREATE_PROJECT`      | Register a new collaborative project     |
| 1002 | `JOIN_PROJECT`        | Join an existing project as contributor  |
| 1003 | `INVITE_CONTRIBUTOR`  | Invite a wallet address to a project     |
| 1004 | `ACCEPT_INVITATION`   | Accept a project invitation              |
| 1005 | `ADD_TIMELINE_EVENT`  | Add an event to the project timeline     |
| 1006 | `CREATE_MILESTONE`    | Create a project milestone               |
| 1007 | `COMPLETE_MILESTONE`  | Mark a milestone as completed            |
| 1008 | `LINK_GITHUB_COMMIT`  | Link a GitHub commit to the timeline     |
| 1009 | `ADD_RELEASE`         | Publish a project release                |
| 1010 | `ENDORSE_CONTRIBUTION`| Endorse a contributor's work             |
| 1011 | `CREATE_DISCUSSION`   | Start an onchain discussion              |
| 1012 | `RESOLVE_DISCUSSION`  | Resolve and close a discussion           |

---

## Quick Start

### Backend

```bash
cd backend
go run main.go --rpc :50002 --admin :50003 --seed
```

Flags:
- `--rpc :50002`     — Primary JSON-RPC port (frontend connects here)
- `--admin :50003`   — Admin RPC port
- `--seed`           — Load demo data (2 projects with full history)
- `--export state.json` — Export state on shutdown

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:3000`

---

## RPC API

All communication is via `POST http://localhost:50002/rpc`.

### Submit Transaction

```json
{
  "jsonrpc": "2.0",
  "method": "dharma_submitTransaction",
  "params": {
    "tx_type": 1001,
    "sender": "cnpy1...",
    "payload": {
      "project_id": "proj_example_123",
      "name": "My Project",
      "description": "Built on Canopy",
      "category": "socialfi",
      "repository_url": "https://github.com/...",
      "creator": "cnpy1...",
      "created_at": 1700000000
    }
  },
  "id": 1
}
```

### Query Methods

| Method                    | Description                        |
|---------------------------|------------------------------------|
| `dharma_listProjects`     | List all projects (with filters)   |
| `dharma_getProject`       | Get a single project by ID         |
| `dharma_getTimeline`      | Get project timeline events        |
| `dharma_listTransactions` | List recent transactions (explorer)|
| `dharma_getStats`         | Network-wide statistics            |

---

## Demo Scenario

1. Start node with `--seed` — loads 2 projects with full history
2. Open `http://localhost:3000`
3. Click **Connect Wallet** — enter any `cnpy1...` address or generate one
4. Navigate to **Projects** — see seeded projects
5. Click a project → explore Timeline, Milestones, DNA tab
6. Create a new project (writes `CREATE_PROJECT` tx)
7. Add timeline events as a contributor
8. Create and complete milestones
9. Start and resolve a discussion
10. Publish a release
11. Open **Explorer** — see every action as a custom Canopy transaction
12. Refresh the page — state persists from blockchain

---

## Folder Structure

```
dharma-protocol/
├── backend/
│   ├── main.go                        # Entry point, demo seed
│   ├── plugin/
│   │   ├── rpc/server.go              # JSON-RPC server (port 50002/50003)
│   │   ├── state/store.go             # In-memory state derived from blockchain
│   │   ├── transactions/processor.go  # Tx routing, validation, execution
│   │   └── types/types.go             # All type definitions
│   └── transactions/
│       ├── types.go                   # Tx type constants
│       ├── messages.go                # Message structs
│       └── validator.go               # Validation logic
└── frontend/
    └── src/
        ├── App.tsx                    # Router, wallet context, toast system
        ├── pages/
        │   ├── Landing.tsx            # Hero with animated timeline
        │   ├── Dashboard.tsx          # Stats, recent projects, activity
        │   ├── Projects.tsx           # Project listing with filters
        │   ├── ProjectDetail.tsx      # Full project view (6 tabs)
        │   └── Explorer.tsx           # Blockchain transaction explorer
        ├── components/
        │   ├── Navbar.tsx             # Wallet connection, navigation
        │   ├── ContributionGraph.tsx  # SVG contributor network
        │   ├── CreateProjectModal.tsx
        │   ├── AddTimelineEventModal.tsx
        │   ├── CreateMilestoneModal.tsx
        │   ├── CreateDiscussionModal.tsx
        │   ├── AddReleaseModal.tsx
        │   ├── JoinProjectModal.tsx
        │   └── colors.ts              # Category/event color system
        ├── services/rpc.ts            # All RPC calls
        ├── hooks/useWallet.ts         # Wallet state management
        └── types/index.ts             # TypeScript types
```

---

## What Makes This Different

This is not a DAO. This is not a reputation system.

**Dharma Protocol is a SocialFi collaboration protocol.**

- GitHub tracks code. Dharma tracks the _people_ behind the code.
- Discord tracks conversation. Dharma makes decisions permanent.
- Notion tracks documents. Dharma tracks who wrote them and when.

Every `CREATE_PROJECT`, `JOIN_PROJECT`, `ADD_TIMELINE_EVENT`, `COMPLETE_MILESTONE`, `RESOLVE_DISCUSSION`, and `ADD_RELEASE` is a first-class Canopy blockchain transaction — validated, executed, persisted, and queryable forever.

The project's **DNA** view shows the visual history: contribution network, milestone tree, timeline, and release history — all sourced directly from the chain.

---

## Tech Stack

- **Backend:** Go · Canopy Network Go Template · Custom Plugin · JSON-RPC
- **Frontend:** React · TypeScript · Vite · TailwindCSS v4
- **Fonts:** Syne (display) · Space Grotesk (body) · JetBrains Mono (code)
- **No mocked data** — every action requires a real Canopy RPC call
