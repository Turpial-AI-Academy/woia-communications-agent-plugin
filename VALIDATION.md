# Validation

Domain regression: `node --test tests/domain.test.mjs`. Centralized thin certification: Ecosystem v0.5.4 `plugin:certify-thin` on a committed clean candidate. The official scaffold tooling is retained as authoring-only support.

These tests exercise deterministic action semantics, denial paths, idempotency and state transitions with synthetic authority and atomic-store fixtures. Actual host, account/source configuration, durable store concurrency/crash qualification and live external adapter = NOT_RUN. Operator E2E = NOT_RUN; Production Ready = false.

Canonical LICENSE is preserved byte-for-byte from the official scaffold. Tests and authoring scripts are excluded from portable payload; capability helpers under skills are shipped.
