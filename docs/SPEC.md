# Prism Relay

An original three-player shedding-card game: you, Mira and Sol. A tactile night-shift card club with cream paper, deep teal felt, geometric suit marks and four named spectra (Coral ●, Gold ◆, Mint ▲, Azure ■). No branded assets or logos. Match to 250 points; quick rounds, seven-card hands, 108-card deck. You lead round one; starting seat rotates each round. Clockwise initially.

## Settled decision tree

The user explicitly delegated recommended choices. No interactive interview occurred. Grill with Docs was adapted into this written design tree: scope → three players/single mode; rules → enforced legality/compact match; architecture → pure rules reducer/limited AI projection; persistence → local complete-state saves/version validation; interaction → buttons/native dialogs/keyboard; verification → reducer/save/lifecycle seams and visible Chrome play. These seams are authorized by the delegated testing request. Standards and spec independent reviews use the initial documentation commit as fixed point.

## Rules and departures

Reference: [Mattel W2085 instructions](https://service.mattel.com/instruction_sheets/W2085-UNO.pdf), accessed 2026-10-12. Original adaptation, unaffiliated with Mattel.

- Four spectra, 0 once and 1–9 twice per spectrum, two each Skip, Reverse, Draw Two; four Wild and four Wild Draw Four. Match spectrum or number/action symbol. Wild always legal.
- Draw Two/Four immediately make the next seat draw and lose its turn. No stacking, no responding to a penalty. If supply runs out, draw as many as available.
- Voluntary draw allowed even with a playable hand. Draw exactly one; only that card may be played this turn, or pass. An unplayable draw passes automatically. With no available draw, pass; three consecutive supply-empty passes end a blocked round, no points.
- Wild Draw Four allowed only without any card of the active spectrum, even when another symbol matches. Engine prevents illegal play, so no bluffing or challenge/hand reveal. Restriction includes cards held before a voluntary draw.
- Number-only opening discard, selected without losing other cards. All opening actions return to the draw pile. This differs from publisher opening action effects. No two-player mode; two-player Reverse semantics do not apply. Reverse changes direction among all three seats.
- Press “Relay!” while holding two, then play down to one. Missing declaration incurs two cards immediately (automatic catch); bots always declare. No timed catch window. Declaration lasts this turn only, and is preserved on reload; drawing disarms it.
- Any card can finish. Final draw penalties resolve before scoring; final wild still requires spectrum selection. Cancel/Escape selection leaves hand and turn unchanged.
- Winner earns opponents’ remaining cards: face value for numbers, 20 actions, 50 wilds. First to 250 wins match (publisher target is 500). No points on blocked rounds.
- Draw exhaustion shuffles all discards except the top, preserving its active spectrum. Each transition conserves all 108 unique cards. Score persists across rounds. Rematch resets scores with confirmation.

## Acceptance

Playable complete rounds/matches against limited-information AI. AI accepts only own cards and public discard, spectrum, direction and counts; never receives opponents’ cards, order of deck or random seed. Opponent UI shows count and anonymous backs only, no hidden labels/tooltips. Complete state autosaves after every committed action; reload at AI turn safely schedules one action. Corrupt or incompatible saves ignored with clear message. Local saves are inspectable/editable and not cheat-proof. Save failure must be shown.

Accessible labeled native controls, focus feedback, non-color card labels/marks, modal keyboard handling, reduced motion, responsive phone layout. Draw/pass and declaration keyboard shortcuts; clear turn/live event log, legal hand cards indicated, tutorial, score, round result and match result, rematch. Wild dialog pauses delayed AI, cancellation is safe. Repeated input cannot act for a different seat. AI timers are generation guarded and cancelled on dialog/reset/reload. No audio required; no paid services or public hosting.

Validation: public rule/save/AI/lifecycle tests, conservation simulations, typecheck/build/audit, GitHub Actions exact final SHA; independent standards/spec reviews; visible Mac Chrome normal controls complete games and edge flows, screenshot inspection and honest physical-device limitations. Safe detached loopback server; preserve earlier servers.
