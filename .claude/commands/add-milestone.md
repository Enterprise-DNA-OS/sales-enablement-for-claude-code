---
description: "Add milestone"
---

# add-milestone

Define an exercise, milestone or outcome before anyone enrols.

Read README.md and docs/compliance.md. Run:

```bash
npm run enablement -- add-milestone --program=... --name=... --kind=... --target=... --unit=... --day-offset=... --actor=... --json
```

Replace placeholders with operator-supplied values. Never pass the literal dots. Names and id prefixes are supported. If ambiguous, show candidates and ask which record. Present the result in plain language. Do not infer evidence, dates, completed work or approval.

Read the affected record first. Use the actual operator name as actor. Run with --dry-run before bulk work, inspect the result, then apply the authorised change. Actor labels are attribution, not authentication.
