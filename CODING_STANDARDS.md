# Standards

Strict TypeScript. Rules are pure transitions with deterministic state-owned random shuffle; UI never changes engine state directly. AI consumes its limited view only. Preserve deck identity/conservation, reject illegal actions without mutation. No hidden-hand DOM content. Text from persisted state must never enter HTML. Timers are cancelled and generation guarded. Native buttons/dialogs have readable labels and visible focus. Tests exercise exported behavior. No external runtime services or telemetry.
