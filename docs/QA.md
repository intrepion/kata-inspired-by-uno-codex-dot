# Verification evidence

2026-10-12. Actual Mac Chrome page at http://127.0.0.1:5202, operated through the supported Chrome extension using normal named card buttons, native dialogs and keyboard controls. Input selection read the human hand and public page UI only. No game-state injection, seeded browser deals, hidden test unlocks, accelerated timers, direct engine calls or concealed-hand reads were used for browser play.

## Complete Chrome match

| Round | Winner | Award | Observed result                                                                  |
| ----- | ------ | ----- | -------------------------------------------------------------------------------- |
| 1     | Sol    | 120   | Loss result, saved/reloaded with scores intact                                   |
| 2     | Sol    | 71    | Final Skip observed; Sol reached 191                                             |
| 3     | Mira   | 55    | Loss and next deal                                                               |
| 4     | Sol    | 49    | Human Relay declaration, one-card hand, subsequent draw effects; Sol reached 240 |
| 5     | Mira   | 104   | Human drawn-choice reload and P pass; result review/reopen                       |
| 6     | You    | 38    | Successful declaration and final card; real player win                           |
| 7     | You    | 48    | Successful declaration and final card; player reached 86                         |
| 8     | You    | 71    | Draw Two, Reverse and Skip, penalties, drawn choices, declaration and final card |
| 9     | Mira   | 112   | Complete match: You 157, Mira 271, Sol 240; match-loss result                    |

Match result survived reload. Cancelling rematch retained all scores. Confirming rematch reset all scores and dealt seven cards to each seat. Then a human play was interrupted by New Match before delayed AI completion, and confirming reset left a stable fresh seven-card deal with no stale opponent action. The final tab is left ready to play.

Additional observed flows: Skip and direction reversal both ways; human Draw Two, AI Draw Two/Four and immediate draw/skip effects; a human Wild Draw Four correctly disabled while holding active-spectrum Coral; plain Wild selection and committed spectrum changes; Escape and Cancel selection preserving card/turn; tutorial opened during AI thinking and opponent counts stayed frozen until closure; reload mid-AI turn resumed; voluntary draws, playable drawn cards, unplayable automatic pass, only drawn card enabled after reload; repeated D drew only one card; D/P/R and Enter keyboard actions; Relay arming and successful down-to-one plays, drawing disarming; reset cancellation; win/loss and round/match progression. Opponent DOM/accessibility labels contained counts and anonymous backs, without faces or tooltips.

## Visual inspection

Desktop full-page screenshots, 390×844 phone layout and modal, and 320×640 narrow layout inspected. No horizontal overflow in the narrow check. Phone layouts wrap cards with readable non-color names/marks and reachable controls. A clipped Wild Draw Four central symbol was found in the final fresh-deal inspection, corrected with a compact symbol size, rebuilt/reloaded, and visually rechecked on desktop and phone. Viewport override restored afterward.

Screenshots: [fresh table](screenshots/fresh-table.jpg), [complete match](screenshots/match-result.jpg), [player win](screenshots/round-win.jpg), [round loss](screenshots/round-loss.jpg), [Relay](screenshots/relay-declaration.jpg), [phone table](screenshots/phone-table.jpg), [phone wild](screenshots/phone-wild.jpg), [final phone card art](screenshots/phone-final-cards.jpg). The early round-loss screenshot predates grammar polish; the complete-match and fresh-table shots show the final writing/artwork.

Chrome log inspection found warnings from a third-party extension content script, with no observed application errors.

## Automated validation

26 Vitest tests in four files. Public rule/save/AI/lifecycle seams cover spectrum/number/symbol matching; strict Wild Draw Four legality; no stacking; penalties/skips/direction; voluntary drawing, drawn-only play and pass; atomic wild selection; declaration penalties and persistence; final action cards with literal worked scoring expectations; deck recycling preserving top and active spectrum; short supply penalties; blocked rounds; lead rotation and retained scores; corrupt JSON/version/pack IDs/nonwild active spectrum; hidden-hand/deck invariance of AI decisions; timer cancellation, replacement and a queued callback that cannot be physically cancelled.

100 deterministic complete-match simulations assert all 108 unique cards are conserved and complete-state saves validate after every transition. Every seat wins at least one simulated match. These are model simulations, separate from the Chrome match above. Final local typecheck, test suite, production build, audit (zero vulnerabilities), and git whitespace check passed. The symbol-only visual fix was additionally rebuilt and inspected; GitHub Actions runs all checks on the exact final commit linked in the delivery response.

Independent standards and spec reviews, fixes and rechecks are recorded in [REVIEW.md](REVIEW.md). Both reported no remaining implementation blockers after the save and pass-control fixes.

## Delivery and boundaries

Private GitHub repository verified. Safe launcher checked port 5202, detached Node server PID 28547 with parent PID 1, and HTTP 200 plus actual Chrome page/asset load were verified after detaching. It binds loopback only, has no boot/login autostart and leaves earlier servers/repos intact. Restart instructions are in README. No sidebar registration is claimed.

Native Chrome access reported the Mac locked and automatic unlock unsuccessful. Native foreground focus/visibility and physical keyboard/pointer tests therefore remain unverified and require manual unlock; no lock bypass or security-setting changes were performed. Extension-routed actual Chrome page interactions and screenshots worked. No physical touchscreen or screen-reader test occurred; responsive viewport emulation is not physical-device evidence. No audio is included, so there is no audio playback/listening claim. Saves are local, inspectable/editable and not cheat-proof; simultaneous tabs use independent in-memory games and last-write-wins storage, as disclosed in the tutorial. Use one tab per match. Blocked supply, missed-declaration penalties, recycling and all final-action scoring are covered in model tests; they are not claimed as every possible live-browser edge case.
