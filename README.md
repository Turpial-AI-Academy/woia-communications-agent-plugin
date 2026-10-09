# woia-communications

Durable human-channel ingress/outbound with Customer Service-only external execution and contextual authenticated staff recipient guards.

Native thin shared provider, version 0.5.7. Agent Plugin 1.0.0 distribution; no orchestrator, MCP server or chosen database.

- [Skill](skills/woia-communications/SKILL.md)
- [Contract](skills/woia-communications/references/CONTRACT.md)
- [Ports](skills/woia-communications/references/PORTS.md)

Actions: `communication.external.receive`, `communication.external.send`, `communication.internal.send`, `communication.status.observe`, `communication.effect.reconcile`, `communication.handoff`, `communication.takeover`.

Run `mise run ci:fast` for source, schema and portable payload checks. Commit the candidate, then run `mise run plugin:certify-thin --repo <absolute-provider-path>` from Ecosystem v0.5.7.

A host must supply fresh authenticated authority, source and atomic persistence ports. No credentials or private organization values are included. Local synthetic PASS does not imply external adapter qualification, admission, release, Operator E2E or Production Ready.

## Maintenance

Edit only this canonical repository. Keep `plugin.json`, `package.json` and `dev.woia/manifest.json` versions aligned. From the canonical WOIA Ecosystem repository, run `mise run plugin:certify-thin --repo <absolute-plugin-repository>`, then use its release preparation/publication tasks. Install and update consumers from immutable published artifacts; keep Project personalization in overlays.
