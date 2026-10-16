# Sales Enablement for Claude Code

Own the weekly sales coaching review: program assignments, milestone evidence, rep progress, playbooks and follow-ups in one database.

## Three ways to own it

- **Do it yourself:** free MIT-licensed code with Claude Code, Codex, OpenCode or Cursor. Hosting, agent subscriptions and your time remain your costs.
- **We customise it:** Enterprise DNA brings your Salesforce Sales Programs records across, adds your fields and rules, and builds the screens and connections you need. A different stack is an option.
- **We run it for you:** Omni by Enterprise DNA installs, connects and operates your version. One setup fee, then a monthly retainer.

[Book 30 minutes with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=salesforce-sales-programs).

## Start with the fictional demo

Node 20 or newer. No database account required.

```bash
npm install
npm run demo
npm run enablement -- ramp-review
npm run enablement -- milestone-check
npm run enablement -- coaching-queue
npm run enablement -- weekly-review --json
npm run view
npm run docs
npm test
```

PGlite stores the demo in `.data/db`. Set `DATABASE_URL` for PostgreSQL 15 or newer, or `DATA_DIR` for a separate embedded database. Start real work with a fresh database and `npm run migrate`. Never seed a business database. The demo uses fictional people and dates relative to today.

## The working week

Review `/ramp-review`, discuss `/milestone-check`, work through `/coaching-queue`, check `/playbooks`, and write `/weekly-review`. `/attention` finds overdue milestones, coaching actions, stale playbooks and active assignments without a recent evidence check. The quiet threshold is a house rule of seven days.

Use `/program` to inspect a definition and its people. Define a program and its milestones before enrolling anyone. Each milestone is an exercise, a measurable milestone or an outcome, with its own target, unit and deadline measured from the start date. Definitions freeze once people enrol. Create a new version to change targets. `/set-program` changes its owner and objective without moving those targets.

`/log-progress` records an **absolute verified value**, the evidence, the observation date and who recorded it. Repeating the same value does not add it twice. `/complete-program` requires every milestone to reach its target with evidence. `/reopen-program` records a reason, then allows a correction. Earlier recorded values remain in the audit history. Neither a completed exercise nor a sales outcome proves that training caused revenue.

Every mutation requires `--actor` and accepts `--dry-run`. Dry runs roll back both records and audit events. Names match case-insensitively and id prefixes work. Ambiguous matches print candidates and exit 1. Every CLI command accepts `--json`. `npm run enablement -- help` shows all flags. Actor names record attribution; they are not authentication.

## Ten questions answered from your records

These are working questions, not a claim that Salesforce cannot be configured to answer them.

1. Which rep has overdue milestones despite finishing an exercise? (`ramp-review`, `milestone-check`)
2. Which outcome has no verified evidence? (`milestone-check`)
3. Who has gone more than seven days without a recorded evidence check? (`attention`)
4. Which coach owns an overdue follow-up? (`coaching-queue`)
5. Which playbook is still being used past its review date? (`playbooks`)
6. What did the old system report that we have not verified yet? (`imported-progress`)
7. Which program has the most unverified milestones? (`programs`)
8. Which reps need a review of why we retain their coaching records? (`compliance`)
9. Who changed a progress value, and what evidence did they record? (`history`)
10. What must happen before this assignment can be marked complete? (`program`, `milestone-check`)

## Your first hour: ten things to ask for

1. Put our name, logo and colours in `brand.json`.
2. Show the overdue coaching work.
3. Explain one rep's incomplete program.
4. Draft a coaching brief from the evidence.
5. Check which playbooks need review.
6. Map the columns in our Salesforce report export.
7. Do a dry run and reconcile the import counts.
8. Record the lawful purpose and review date for our coaching records.
9. Add our own program with targets and evidence requirements.
10. Add a read-only report or a field through `/new-view` and `/customise`.

## Switching, documents and boundaries

[The switching guide](docs/replace-salesforce-sales-programs.md) describes the one-command import after report preparation and field mapping. It preserves source rows and reported progress separately from verified evidence. Report exports differ across Salesforce versions and accounts. The included fixture is synthetic, not a captured customer export. Test your actual export before cutting over.

`npm run docs` produces program review packs, coaching briefs and program evidence records. `npm run view` produces three branded, read-only dashboards. These files contain private records. Open them locally or print them to PDF. `/draft-coaching` writes internal notes to `drafts/` and sends nothing.

This base replaces the recordkeeping and review workflow. It does not implement in-app guidance, a course player, automatic CRM activity measurement, conversation analysis, notifications or Salesforce permission replication. Connections and screens are separate custom work. [Why no front end](docs/why-no-front-end.md) explains that boundary. [Record checks](docs/compliance.md) separates privacy guidance from house rules.

One business, trusted operators. Keep the owner database connection away from browsers. Database tables deny public access and views use caller privileges. That does not implement per-rep access control. Protect local files and backups, and agree access roles before shared use. The archive includes all domain records and audit history; restoration needs an operator-reviewed migration, not an automatic import.

## Verification and licence

`npm test` uses a temporary database, migrates twice, seeds twice and exercises every CLI command. It checks evidence gates, correction, ambiguity, date validation, import rollback, repeat imports, append-only history, exports and HTML escaping. Windows, Ubuntu and PostgreSQL jobs are configured in CI. Execution results belong in the run report. `TEST_DATABASE_URL` must point at an empty disposable database.

MIT. Copyright 2026 Enterprise DNA. Independent of Salesforce and Anthropic.
