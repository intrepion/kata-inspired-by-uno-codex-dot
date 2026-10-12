# Prism Relay

A private, original shedding-card browser game for one person and two fair AI opponents. Four geometric spectra, sculpted paper cards and a night-club table. Match spectrum, number or action; change direction, skip seats, draw penalties and choose a wild spectrum. Call **Relay!** before your last card. Play successive rounds to 250 points.

## Play locally

Requires Node.js 24 and npm.

```sh
npm ci
npm run build
npm start
```

Open **http://127.0.0.1:5202**. The launcher checks the port, binds loopback only, and detaches a session-only process from the terminal. It never installs boot/login autostart. Existing repositories and servers are preserved. `server.log` and `.server.pid` are ignored. If the recorded process is running, the launcher avoids a duplicate; verify it before stopping anything. After logout/reboot or once that owned process has exited, repeat `npm run build && npm start`. An alternative free port is `npm start -- 5203`.

For development, `npm run dev` uses the same port and refuses if occupied. Production is served from `dist`; rebuild and reload after source edits.

## Controls and compact rules

Use card buttons or Tab/Enter. **D** draws one, **P** passes a drawn card, **R** declares Relay. Native dialogs trap focus; Escape cancels a wild without consuming it. The tutorial contains all rules and departures. A New Match/rematch confirmation protects scores. Every committed action autosaves, including drawn choices and AI turns; reload resumes safely. Play one tab per match.

- Standard 108-card distribution, seven cards, three seats. No two-player mode.
- Match spectrum or number/action symbol. Wild is always legal. Wild Draw Four requires no active-spectrum card in hand; enforcement replaces bluff/challenge/hand revelation.
- No draw stacking. Penalties draw immediately and skip their victim. Voluntary one-card draws allowed; only the newly drawn card can play, or pass. An unplayable draw passes automatically.
- Number-only opening discard; starting seat rotates each round, clockwise initially.
- Press Relay with two cards before playing down to one. An automatic two-card penalty replaces the publisher’s timed catch window; bots declare reliably.
- Any card may finish, including a wild after spectrum selection. Final draw penalties resolve before scoring. Numbers score face value, actions 20, wilds 50; winner takes opponents’ remaining points. First to 250 wins, versus publisher target 500.
- Empty supply recycles all discards except the top and preserves active spectrum. With no supply, penalties draw what is available; three successive empty draws end a blocked round with no score.

[Detailed specification](docs/SPEC.md) · [Glossary](GLOSSARY.md) · [Architecture decision](docs/adr/0001-enforced-wilds-and-atomic-turns.md). Inspired by [Mattel's publisher instructions](https://service.mattel.com/instruction_sheets/W2085-UNO.pdf); original title, graphics and writing, unaffiliated with Mattel. No copied logos/assets, paid services, external fonts, telemetry or public deployment.

## Verify

```sh
npm run check
npm audit --audit-level=low
```

Strict TypeScript, Vitest rule/save/AI/lifecycle tests, deterministic full-match conservation simulations and production Vite build. GitHub Actions runs the same checks and audit. [QA evidence](docs/QA.md) distinguishes actual Chrome interactions from simulations; [independent reviews](docs/REVIEW.md) record fixes.

Complete-state local saves necessarily contain every hand and are inspectable/editable, so they are **not cheat-proof**. AI decisions receive only their own cards and public information. Opponent faces never appear in the UI or accessibility labels. No audio is included. The game is designed for mouse, keyboard and touch; responsive browser emulation is separate from physical touchscreen testing.
