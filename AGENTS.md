# Architecture rules
- Keep Centro Fox training content and routes separate from CFL; prefix all participation keys by session to prevent mixing public results and scope its branding tokens to the session pages.
- Keep the Observatorio in its own page, hook and domain helpers; it publishes only public editorial references so client portals and private reports stay isolated.
- Persist Observatorio verticals, keywords and signals in dedicated Cloud tables with public reads and existing ops-write policies; never put client-private material in these tables.
- Keep Observatorio creative briefs self-contained and copyable, with structured audience, objective, outline and cautions; do not couple it to Content Engine.
- Monitor all verticals through one named scheduled batch with authenticated per-vertical workers, sourced date validation and persistent run status; pause the batch on terminal provider or credit failures.
- Mixed Observatorio editions contain matched geographic pairs and daily milestones require verified non-reference publication timestamps within 24 hours; this prevents false balance and stale daily claims.
- Scope public Observatorio queries to the current vertical and expose hub/cross-vertical navigation only through existing authenticated ops roles; public data remains public, but discovery stays internal.
- Validate each monitored Observatorio association against explicit per-vertical central-topic criteria and a literal source citation before persistence; keyword overlap and creative angles are not evidence of topical fit.