# Architecture rules
- Keep the Observatorio in its own page, hook and domain helpers; it publishes only public editorial references so client portals and private reports stay isolated.
- Persist Observatorio verticals, keywords and signals in dedicated Cloud tables with public reads and existing ops-write policies; never put client-private material in these tables.
- Pass only a signal identifier to Parrilla and insert its sourced brief into a user-selected existing cycle after authentication; this avoids duplicating editorial generation or silently creating content.
- Mixed Observatorio editions contain matched geographic pairs and daily milestones require verified non-reference publication timestamps within 24 hours; this prevents false balance and stale daily claims.