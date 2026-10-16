# Record checks for a sales coaching desk

This is a review aid for an NZ operator, not a compliance certificate. It does not decide employment matters or certify competence. An Australian operator must assess the rules applying to their business before using employee records.

## Cited rules

| Rule | What the command checks | What still needs a person |
|---|---|---|
| NZ Privacy Act principle 9, retention | RETENTION_REVIEW flags a rep without a purpose or review date, or whose review is overdue | Decide how long the records are needed for a lawful purpose, including source exports, backups and audit history. A review date is our control, not a statutory fixed period. |
| NZ Privacy Act principle 8, accuracy | UNVERIFIED_PROGRESS flags milestones with no locally verified evidence. Imported numbers never satisfy completion on their own. | Check accuracy, completeness, relevance and context before using a record. A supplied evidence string does not prove that a claim is true. |
| NZ Privacy Act principle 5, security | MANUAL_SECURITY always remains in the report | Review access, safe storage, backups and disclosure. No automatic test proves reasonable safeguards. |

Sources checked 16 October 2026: [principle 9](https://www.privacy.org.nz/privacy-principles/9/), [principle 8](https://www.privacy.org.nz/privacy-principles/8/), [principle 5](https://www.privacy.org.nz/privacy-principles/5/).

## House controls

Seven days without an evidence check triggers attention. A playbook review date is a date the operator sets. Targets and units are business definitions, not legal thresholds. These controls are not claimed to be imposed by a regulator or absent from a Salesforce subscription.

A completed assignment needs every task to meet its target with recorded evidence. Import snapshots, training participation and revenue outcomes are separate concepts. No causal revenue attribution or automatic employment recommendation is produced. A mistaken completion can be reopened with a reason and corrected. History remains visible.

## Access and retention

The CLI assumes trusted operators in one business. Actor labels are not authentication. Public table grants are revoked and row level security is enabled with no public policies. The owner connection can read all records. Do not expose it to a web client. Before shared use, implement and test role-based access and review backups. Export and draft files also contain personal information.

Audit events and raw source rows reject updates and deletes. This protects routine operation, but does not settle a retention or correction request. An authorised operator must plan a scoped migration and backup treatment when information should be removed. Do not simply keep it forever because the routine CLI has no delete command.
