# Enforced wild legality and atomic turns

We enforce Wild Draw Four legality rather than model bluffing and challenges: a private-hand browser game would otherwise need intentional hand revelation. Draw penalties and declaration penalties resolve atomically, avoiding a fragile catch timer and making every committed state safe to reload. This changes the publisher's challenge/catch mechanics; rules explain it explicitly. The AI receives a separate projection containing its own hand and public counts, never the complete state.
