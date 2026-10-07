# Communications contract

Source: WOIA Real Estate eb0a7278188b2f9968e21ed4299f08184d864cac; ADR-0026/0027/0029/0030 and docs/17,21,22,24,25.

External ingress/send is Customer Service-only. Internal send requires host-resolved authenticated current Workforce membership for this organization, recipient, purpose and account. Vendor, external professional or an employee acting externally cannot be relabeled internal. Resolve Subject, ContactPoint, channel/account, current purpose/consent, exact content version and business origin before contact.

Incoming verified messages preserve originals as durable Interaction, deduplicated by organization/account/provider message ID. Replies increment conversation generation and supersede queued obsolete contact. Handoff/takeover gives human ownership and suppresses queued effects without pretending to undo submitted effects. Status submitted/sent/delivered/read is distinct from business completion.

Outbound is PREPARED first. The host transaction reserves dispatching before the qualified adapter executes, fences the worker and refreshes current authority. Timeout, missing provider receipt or restart while dispatching means unknown: retain and reconcile before retry. Reconciliation requires attributable exact account/provider evidence. Definitive not-sent proof is required to mark failed; new retry intent gets fresh exact authority. Adapter status does not authorize resuming human-owned contact.

Kapso/WhatsApp is the initial required adapter. The narrow portable adapter accepts an injected official qualified WhatsAppClient and SDK webhook verification/normalization. Other media/template channels are not advertised. No SDK pin, private account or credentials are invented; deployment supplies a qualified SDK/account binding. Mocked API contract tests PASS does not qualify live transport.

Official sources checked 2026-10-07: [messages](https://docs.kapso.ai/docs/whatsapp/typescript-sdk/messages), [utilities](https://docs.kapso.ai/docs/whatsapp/typescript-sdk/utilities), [SDK repository](https://github.com/gokapso/whatsapp-cloud-api-js). sendText phoneNumberId/to/body and signed normalized webhook ports follow the official SDK boundary. No blind resend or inferred remote absence is implemented.

Calendar/signature/payment/document providers must suppress embedded external invitations/notifications and route separate exact person-contact intents through Communications/Customer Service. No agent-to-agent transport, Task engine, human negotiation or legal/financial authority is owned here.
