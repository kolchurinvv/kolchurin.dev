// Command dump-opencode-session reads a single session from opencode's local
// SQLite store (~/.local/share/opencode/opencode-stable.db by default) and
// writes it out as a readable markdown transcript.
//
// Usage:
//
//	go run ./scripts/dump-opencode-session <session_id> [-o out.md] [-db PATH]
//
// Find session IDs by querying the DB directly:
//
//	sqlite3 -readonly ~/.local/share/opencode/opencode-stable.db \
//	  "SELECT id, title FROM session ORDER BY time_created DESC;"
package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	_ "modernc.org/sqlite"
)

// part covers every JSON shape we expect under the `data` column of the `part`
// table. Fields are optional — only those relevant to a given `Type` are set.
type part struct {
	Type     string          `json:"type"`
	Text     string          `json:"text,omitempty"`     // text, reasoning
	Tool     string          `json:"tool,omitempty"`     // tool
	Title    string          `json:"title,omitempty"`    // tool
	State    *toolState      `json:"state,omitempty"`    // tool
	Files    []string        `json:"files,omitempty"`    // patch
	Snapshot string          `json:"snapshot,omitempty"` // step-start
	Raw      json.RawMessage `json:"-"`                  // kept for unknown types
}

type toolState struct {
	Status string          `json:"status"`
	Input  json.RawMessage `json:"input"`
	Output json.RawMessage `json:"output"` // sometimes string, sometimes object
}

// message mirrors the JSON in `message.data`. We only care about role + model + time.
type message struct {
	Role  string `json:"role"`
	Model *struct {
		ProviderID string `json:"providerID"`
		ModelID    string `json:"modelID"`
	} `json:"model,omitempty"`
	Time struct {
		Created int64 `json:"created"`
	} `json:"time"`
}

const maxToolOutputBytes = 4000

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
}

func run() error {
	defaultDB := filepath.Join(os.Getenv("HOME"), ".local/share/opencode/opencode-stable.db")
	dbPath := flag.String("db", defaultDB, "path to opencode SQLite database")
	out := flag.String("o", "", "output markdown path (default: ./<session_id>.md)")
	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "Usage: %s [-db PATH] [-o OUT] <session_id>\n", os.Args[0])
		flag.PrintDefaults()
	}
	flag.Parse()

	if flag.NArg() != 1 {
		flag.Usage()
		return errors.New("expected exactly one session_id argument")
	}
	sessionID := flag.Arg(0)
	outPath := *out
	if outPath == "" {
		outPath = sessionID + ".md"
	}

	// Read-only connection — opencode may still hold the DB open with a WAL
	// session. Using ?mode=ro tells SQLite not to take any write lock.
	dsn := fmt.Sprintf("file:%s?mode=ro", *dbPath)
	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return fmt.Errorf("open db: %w", err)
	}
	defer db.Close()

	md, msgCount, err := dump(db, sessionID, *dbPath)
	if err != nil {
		return err
	}
	if err := os.WriteFile(outPath, []byte(md), 0o644); err != nil {
		return fmt.Errorf("write %s: %w", outPath, err)
	}
	info, _ := os.Stat(outPath)
	fmt.Printf("Wrote %s (%d bytes, %d messages)\n", outPath, info.Size(), msgCount)
	return nil
}

func dump(db *sql.DB, sessionID, dbPath string) (string, int, error) {
	var (
		title, dir            string
		timeCreated, timeUpd  int64
	)
	err := db.QueryRow(
		`SELECT title, directory, time_created, time_updated FROM session WHERE id = ?`,
		sessionID,
	).Scan(&title, &dir, &timeCreated, &timeUpd)
	if errors.Is(err, sql.ErrNoRows) {
		return "", 0, fmt.Errorf("session %q not found", sessionID)
	}
	if err != nil {
		return "", 0, fmt.Errorf("query session: %w", err)
	}

	var b strings.Builder
	fmt.Fprintf(&b, "# %s\n\n", title)
	fmt.Fprintf(&b, "- **Session ID:** `%s`\n", sessionID)
	fmt.Fprintf(&b, "- **Directory:** `%s`\n", dir)
	fmt.Fprintf(&b, "- **Created:** %s\n", formatTS(timeCreated))
	fmt.Fprintf(&b, "- **Updated:** %s\n", formatTS(timeUpd))
	fmt.Fprintf(&b, "- **Source:** opencode (`%s`)\n\n---\n\n", dbPath)

	rows, err := db.Query(
		`SELECT id, data, time_created FROM message WHERE session_id = ? ORDER BY time_created, id`,
		sessionID,
	)
	if err != nil {
		return "", 0, fmt.Errorf("query messages: %w", err)
	}
	defer rows.Close()

	msgCount := 0
	for rows.Next() {
		var (
			msgID, dataRaw string
			created        int64
		)
		if err := rows.Scan(&msgID, &dataRaw, &created); err != nil {
			return "", 0, fmt.Errorf("scan message: %w", err)
		}
		var m message
		if err := json.Unmarshal([]byte(dataRaw), &m); err != nil {
			return "", 0, fmt.Errorf("parse message %s: %w", msgID, err)
		}
		modelStr := ""
		if m.Model != nil {
			modelStr = fmt.Sprintf(" — `%s/%s`", m.Model.ProviderID, m.Model.ModelID)
		}
		when := m.Time.Created
		if when == 0 {
			when = created
		}
		fmt.Fprintf(&b, "## %s%s\n*%s*\n\n", titleCase(m.Role), modelStr, formatTS(when))

		if err := writeParts(&b, db, msgID); err != nil {
			return "", 0, err
		}
		b.WriteString("---\n\n")
		msgCount++
	}
	if err := rows.Err(); err != nil {
		return "", 0, fmt.Errorf("iterate messages: %w", err)
	}
	return b.String(), msgCount, nil
}

func writeParts(b *strings.Builder, db *sql.DB, msgID string) error {
	rows, err := db.Query(
		`SELECT data FROM part WHERE message_id = ? ORDER BY time_created, id`,
		msgID,
	)
	if err != nil {
		return fmt.Errorf("query parts for %s: %w", msgID, err)
	}
	defer rows.Close()

	for rows.Next() {
		var raw string
		if err := rows.Scan(&raw); err != nil {
			return fmt.Errorf("scan part: %w", err)
		}
		var p part
		if err := json.Unmarshal([]byte(raw), &p); err != nil {
			return fmt.Errorf("parse part: %w", err)
		}
		p.Raw = json.RawMessage(raw)

		rendered := renderPart(p)
		if rendered == "" {
			continue
		}
		b.WriteString(rendered)
		b.WriteString("\n\n")
	}
	return rows.Err()
}

func renderPart(p part) string {
	switch p.Type {
	case "text":
		return strings.TrimRight(p.Text, "\n")
	case "reasoning":
		return fmt.Sprintf("<details><summary>Reasoning</summary>\n\n%s\n\n</details>", strings.TrimRight(p.Text, "\n"))
	case "tool":
		return renderTool(p)
	case "patch":
		var sb strings.Builder
		sb.WriteString("**Patch applied to:**\n")
		for _, f := range p.Files {
			fmt.Fprintf(&sb, "- `%s`\n", f)
		}
		return strings.TrimRight(sb.String(), "\n")
	case "step-start", "step-finish":
		return "" // internal markers
	default:
		return fmt.Sprintf("**Unknown part type `%s`:**\n```json\n%s\n```", p.Type, string(p.Raw))
	}
}

func renderTool(p part) string {
	var b strings.Builder
	fmt.Fprintf(&b, "**Tool call:** `%s`", p.Tool)
	if p.Title != "" {
		fmt.Fprintf(&b, " — %s", p.Title)
	}
	if p.State == nil {
		return b.String()
	}
	if len(p.State.Input) > 0 {
		b.WriteString("\n\n**Input:**\n```json\n")
		b.Write(prettyJSON(p.State.Input))
		b.WriteString("\n```")
	}
	if len(p.State.Output) > 0 {
		b.WriteString("\n\n**Output:**\n```\n")
		b.WriteString(truncateOutput(decodeOutput(p.State.Output)))
		b.WriteString("\n```")
	}
	return b.String()
}

// decodeOutput unwraps a JSON string if Output is a quoted string, otherwise
// returns a pretty-printed JSON object. Opencode stores either form.
func decodeOutput(raw json.RawMessage) string {
	var s string
	if err := json.Unmarshal(raw, &s); err == nil {
		return s
	}
	return string(prettyJSON(raw))
}

func prettyJSON(raw json.RawMessage) []byte {
	var pretty bytes.Buffer
	if err := json.Indent(&pretty, raw, "", "  "); err != nil {
		return raw
	}
	return pretty.Bytes()
}

func titleCase(s string) string {
	if s == "" {
		return s
	}
	return strings.ToUpper(s[:1]) + s[1:]
}

func truncateOutput(s string) string {
	if len(s) <= maxToolOutputBytes {
		return s
	}
	return s[:maxToolOutputBytes] + "\n…[truncated]"
}

func formatTS(ms int64) string {
	return time.UnixMilli(ms).Local().Format(time.RFC3339)
}
