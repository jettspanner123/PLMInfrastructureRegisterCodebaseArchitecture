# Data Model: Adopt ObservaCore's Light Mode Canvas Color

No database, no backend entity, no persisted setting of any kind. The only "entity" this feature touches is a single CSS custom property.

## Canvas Background Color (existing CSS custom property, one value changed)

| Field | Current value | New value | Notes |
|---|---|---|---|
| `--color-canvas` (`:root`, light mode) | `#ffffff` | `#f2f2f2` | The page's own background, behind every card/panel. Matches ObservaCore's own final, kept value (research.md §1). |
| `--color-canvas` (`.dark`) | `#000000` | `#000000` (unchanged) | Dark mode is explicitly out of scope — not touched. |

**Validation rules**: None — this is a static value, not user input; nothing to validate.

**State transitions**: None — the value is fixed at build time, the same way it is today.

## Every other light-mode variable (unchanged, confirmed identical to ObservaCore)

| Variable | Value (both applications) |
|---|---|
| `--color-surface-card` | `#f8fafc` |
| `--color-surface-elevated` | `#f1f5f9` |
| `--color-surface-deep` | `#f8fafc` |
| `--color-hairline` | `rgba(0, 0, 0, 0.08)` |
| `--color-hairline-strong` | `rgba(0, 0, 0, 0.16)` |
| `--color-ink` | `#09090b` |
| `--color-body` | `#334155` |
| `--color-charcoal` | `#475569` |
| `--color-mute` | `#64748b` |
| `--color-ash` | `#94a3b8` |
| `--color-stone` | `#cbd5e1` |

No other field on any existing data model (resources, environment overview, uptime requests, downtime announcements, feature requests, configuration constants) changes.
