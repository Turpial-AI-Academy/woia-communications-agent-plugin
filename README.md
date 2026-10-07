# woia-communications

Durable human-channel ingress/outbound with Customer Service-only external execution and contextual authenticated staff recipient guards.

Native thin shared provider, version 0.5.0. Agent Plugin 1.0.0 distribution; no orchestrator, MCP server or chosen database.

- [Skill](skills/woia-communications/SKILL.md)
- [Contract](skills/woia-communications/references/CONTRACT.md)
- [Ports](skills/woia-communications/references/PORTS.md)

Actions: `communication.external.receive`, `communication.external.send`, `communication.internal.send`, `communication.status.observe`, `communication.effect.reconcile`, `communication.handoff`, `communication.takeover`.

Run `node --test tests/domain.test.mjs` for capability regression, `mise run ci:fast` for repository checks. Commit the candidate, then run `mise run plugin:certify-thin --repo <absolute-provider-path>` from Ecosystem v0.5.4.

A host must supply fresh authenticated authority, source and atomic persistence ports. No credentials or private organization values are included. Local synthetic PASS does not imply external adapter qualification, admission, release, Operator E2E or Production Ready.
