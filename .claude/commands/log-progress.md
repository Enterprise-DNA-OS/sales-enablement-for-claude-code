---
description: "Log progress"
---

# log-progress

Record an absolute value supported by evidence. Do not add to the prior value.

Read README.md and docs/compliance.md. Run:

```bash
npm run enablement -- log-progress --enrolment=... --milestone=... --value=... --evidence=... --checked-on=... --actor=... --json
```

Replace placeholders with operator-supplied values. Never pass the literal dots. Names and id prefixes are supported. If ambiguous, show candidates and ask which record. Present the result in plain language. Do not infer evidence, dates, completed work or approval.

Read the affected record first. Use the actual operator name as actor. Run with --dry-run before bulk work, inspect the result, then apply the authorised change. Actor labels are attribution, not authentication.
