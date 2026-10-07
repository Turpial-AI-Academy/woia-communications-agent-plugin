# Persistence and authority ports

The reducers accept externally representable JSON state and a host-authenticated context. The caller must not construct authority from untrusted input. Context is resolved anew at execution time: organization, department, actor, accepted policy version, exact command digest, purpose, resource scope, expiry, revocation and source state. Missing/revoked/expired authority fails closed.

The host owns a qualified transactional store, not a new database mandated by this plugin. Persist state, immutable history and operation uniqueness atomically in one organization/resource scope. For dispatch, reserve an operation through an atomic compare-and-set before network I/O; fence stale workers; commit submitted or unknown receipt without redispatch. Restart with dispatching state means reconcile, never retry. One writer per scope and cross-task uniqueness must be enforced by that store. Reducers alone do not prove runtime enforcement. A production binding must qualify atomicity, fencing, crash recovery, authority refresh and account isolation.

Evidence references are immutable source identifiers; booleans received from a model or external payload cannot authorize effects. Remote observations require a qualified adapter and attributable provenance. No implicit notification is allowed through another provider.
