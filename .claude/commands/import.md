# import

Import a prepared Salesforce item-progress CSV using an explicit mapping.

Read README.md and docs/compliance.md. Run:

```bash
npm run enablement -- import salesforce --file=... --map=... --namespace=... --owner=... --actor=... --json
```

Replace placeholders with operator-supplied values. Never pass the literal dots. Names and id prefixes are supported. If ambiguous, show candidates and ask which record. Present the result in plain language. Do not infer evidence, dates, completed work or approval.

Read the affected record first. Use the actual operator name as actor. Run with --dry-run before bulk work, inspect the result, then apply the authorised change. Actor labels are attribution, not authentication.

Read docs/replace-salesforce-sales-programs.md first. Inspect headers and map meanings, including units and absolute values. Preserve stable ids. Compare imported plus skipped with input rows. Reported source progress never becomes verified evidence automatically. Resolve a changed row explicitly rather than switching namespaces to bypass a conflict.
