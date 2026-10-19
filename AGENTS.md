# Architecture rules
- Keep the Observatorio in its own page, hook and domain helpers; it publishes only public editorial references so client portals and private reports stay isolated.
- Persist Observatorio verticals, keywords and signals in dedicated Cloud tables with public reads and existing ops-write policies; never put client-private material in these tables.
- Keep Observatorio creative briefs self-contained and copyable, with structured audience, objective, outline and cautions; do not couple it to Content Engine.
- Monitor all verticals through one named scheduled batch with authenticated per-vertical workers, sourced date validation and persistent run status; pause the batch on terminal provider or credit failures.
- Mixed Observatorio editions contain matched geographic pairs and daily milestones require verified non-reference publication timestamps within 24 hours; this prevents false balance and stale daily claims.