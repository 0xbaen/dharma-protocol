// Package rpc implements the JSON-RPC server for Dharma Protocol.
// The frontend communicates exclusively through this interface.
// Port 50002: standard RPC  |  Port 50003: admin/query RPC
package rpc

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/dharma-protocol/backend/plugin/state"
	"github.com/dharma-protocol/backend/plugin/transactions"
	"github.com/dharma-protocol/backend/plugin/types"
)

// Server is the Dharma Protocol RPC server.
type Server struct {
	store     *state.Store
	processor *transactions.Processor
	mux       *http.ServeMux
}

// NewServer creates an RPC server wired to the given state store.
func NewServer(store *state.Store) *Server {
	proc := transactions.NewProcessor(store)
	s := &Server{
		store:     store,
		processor: proc,
		mux:       http.NewServeMux(),
	}
	s.mux.HandleFunc("/rpc", s.handleRPC)
	s.mux.HandleFunc("/health", s.handleHealth)
	return s
}

// Start launches the HTTP server on the given address.
func (s *Server) Start(addr string) error {
	log.Printf("[dharma-rpc] listening on %s", addr)
	return http.ListenAndServe(addr, corsMiddleware(s.mux))
}

// ─── HTTP Handlers ───────────────────────────────────────────────────────────

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":       "ok",
		"block_height": s.store.GetBlockHeight(),
		"timestamp":    time.Now().Unix(),
	})
}

func (s *Server) handleRPC(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST only", http.StatusMethodNotAllowed)
		return
	}

	var req types.RPCRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, 0, -32700, "parse error: "+err.Error())
		return
	}

	result, rpcErr := s.dispatch(req.Method, req.Params)
	if rpcErr != nil {
		writeError(w, req.ID, rpcErr.Code, rpcErr.Message)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(types.RPCResponse{
		JSONRPC: "2.0",
		Result:  result,
		ID:      req.ID,
	})
}

// ─── Method Dispatch ─────────────────────────────────────────────────────────

func (s *Server) dispatch(method string, rawParams interface{}) (interface{}, *types.RPCError) {
	// Re-marshal params so we can unmarshal into typed structs
	paramsJSON, _ := json.Marshal(rawParams)

	switch method {

	// ── Transaction Submission ──────────────────────────────────────────────
	case "dharma_submitTransaction":
		var p struct {
			TxType  uint64          `json:"tx_type"`
			Payload json.RawMessage `json:"payload"`
			Sender  string          `json:"sender"`
		}
		if err := json.Unmarshal(paramsJSON, &p); err != nil {
			return nil, &types.RPCError{Code: -32602, Message: "invalid params: " + err.Error()}
		}
		blockHeight := s.store.GetBlockHeight() + 1
		s.store.SetBlockHeight(blockHeight)

		hash, err := s.processor.Process(p.TxType, p.Payload, p.Sender, blockHeight, time.Now().Unix())
		if err != nil {
			return nil, &types.RPCError{Code: -32000, Message: err.Error()}
		}
		return map[string]interface{}{
			"tx_hash":      hash,
			"block_height": blockHeight,
			"timestamp":    time.Now().Unix(),
		}, nil

	// ── Project Queries ─────────────────────────────────────────────────────
	case "dharma_getProject":
		var p struct {
			ProjectID string `json:"project_id"`
		}
		if err := json.Unmarshal(paramsJSON, &p); err != nil {
			return nil, &types.RPCError{Code: -32602, Message: "invalid params"}
		}
		project, err := s.store.GetProject(p.ProjectID)
		if err != nil {
			return nil, &types.RPCError{Code: -32001, Message: err.Error()}
		}
		return project, nil

	case "dharma_listProjects":
		var p struct {
			Category string `json:"category"`
			Creator  string `json:"creator"`
			Limit    int    `json:"limit"`
			Offset   int    `json:"offset"`
		}
		json.Unmarshal(paramsJSON, &p)
		if p.Limit == 0 {
			p.Limit = 20
		}
		projects, total := s.store.ListProjects(p.Category, p.Creator, p.Limit, p.Offset)
		return map[string]interface{}{
			"projects": projects,
			"total":    total,
			"limit":    p.Limit,
			"offset":   p.Offset,
		}, nil

	// ── Timeline ────────────────────────────────────────────────────────────
	case "dharma_getTimeline":
		var p struct {
			ProjectID string `json:"project_id"`
			Category  string `json:"category"`
			Limit     int    `json:"limit"`
		}
		if err := json.Unmarshal(paramsJSON, &p); err != nil {
			return nil, &types.RPCError{Code: -32602, Message: "invalid params"}
		}
		project, err := s.store.GetProject(p.ProjectID)
		if err != nil {
			return nil, &types.RPCError{Code: -32001, Message: err.Error()}
		}
		timeline := project.Timeline
		if p.Category != "" {
			filtered := make([]types.TimelineEvent, 0)
			for _, e := range timeline {
				if e.Category == p.Category {
					filtered = append(filtered, e)
				}
			}
			timeline = filtered
		}
		if p.Limit > 0 && len(timeline) > p.Limit {
			timeline = timeline[len(timeline)-p.Limit:]
		}
		return map[string]interface{}{
			"events": timeline,
			"total":  len(timeline),
		}, nil

	// ── Transactions (Explorer) ──────────────────────────────────────────────
	case "dharma_listTransactions":
		var p struct {
			Limit int `json:"limit"`
		}
		json.Unmarshal(paramsJSON, &p)
		if p.Limit == 0 {
			p.Limit = 50
		}
		txs := s.store.ListTransactions(p.Limit)
		return map[string]interface{}{
			"transactions": txs,
			"block_height": s.store.GetBlockHeight(),
		}, nil

	// ── Stats ────────────────────────────────────────────────────────────────
	case "dharma_getStats":
		projects, total := s.store.ListProjects("", "", 1000, 0)
		txs := s.store.ListTransactions(1000)
		contributors := map[string]bool{}
		for _, p := range projects {
			for _, c := range p.Contributors {
				contributors[c.Address] = true
			}
		}
		return map[string]interface{}{
			"total_projects":     total,
			"total_transactions": len(txs),
			"total_contributors": len(contributors),
			"block_height":       s.store.GetBlockHeight(),
		}, nil

	default:
		return nil, &types.RPCError{Code: -32601, Message: fmt.Sprintf("method not found: %s", method)}
	}
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

func writeError(w http.ResponseWriter, id int, code int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(types.RPCResponse{
		JSONRPC: "2.0",
		Error:   &types.RPCError{Code: code, Message: msg},
		ID:      id,
	})
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}
