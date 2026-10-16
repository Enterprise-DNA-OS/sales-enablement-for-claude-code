# Move the sales enablement review off Salesforce Sales Programs

## Prepare the export

Salesforce documents Program Definition, Program Progress and Program Item Progress report types. Use an administrator with permission to export the relevant records. Export report details as CSV, not a formatted report with totals. Choose UTF-8, or convert the downloaded file to UTF-8 before import. Keep stable ids, not just names.

Use Program Item Progress together with the program definition and assignment fields to prepare one row per assignment and task. Depending on your report type, additional definition fields need a separate export and a join by task id. This preparation is real migration work. Do not invent ids or interpret a percentage as an absolute count. The importer does not claim that one default Salesforce report has every required column.

## Map the fields once

Copy `fixtures/report-map.json` and point each key at the exact header in your prepared export. Labels in the fixture are examples, not universal Salesforce labels. Required meanings:

| Mapping key | Meaning |
|---|---|
| rep_id, rep_name | Stable Salesforce user id and display name |
| program_id, program_name | Stable program id and display name |
| assignment_id | Stable assignment id for this user and program |
| started_on, due_on | Assignment dates, normalized to YYYY-MM-DD |
| task_id, task_name | Stable task id and name |
| kind | Normalized exercise, milestone or outcome |
| target, unit | Positive target and the unit in which progress is measured |
| day_offset | Whole days from assignment start to task deadline, 0 through 3650 |
| reported_value | Nonnegative absolute value in the target's unit, at most two decimals |

If your program uses a percentage, use an explicit percent unit and the matching target. Composite conditions, currency conversion, repeated assignments for one rep/program and automatic measure formulas need custom migration. Create separate program versions for repeat cohorts. Never flatten incompatible measures into one number.

## Import in one command

Start with `npm run migrate` on a fresh database. The first run checks without changing records:

```bash
npm run enablement -- import salesforce --file=fixtures/salesforce-item-progress.csv --map=fixtures/report-map.json --namespace=demo-org --owner="Alex Taylor" --actor="Alex Taylor" --dry-run --json
```

Use your own file, mapping, org namespace and operator. Remove `--dry-run` when the counts and mapping are correct. The same command imports people, programs, definitions, assignments and reported progress. Repeated identical rows are skipped. A changed row or conflicting definition aborts the whole transaction. Use the same namespace for that org every time. Changing mappings on a repeat import also requires reconciliation.

## Reconcile before switching

Compare the exported row count with imported plus skipped. Compare people, program and assignment counts. Inspect `imported-progress`, including each source value. The import keeps the entire raw row for reconciliation. Import only fields necessary for your purpose, because even unused columns are retained in that raw row.

The import deliberately does not turn reported progress into verified progress or mark assignments complete. A coach checks the source evidence and records an absolute verified value with `log-progress`. New imported reps have no retention purpose or review date until you record one with `review-rep`. Use `set-program` to replace the provisional objective with the real one.

Compare a full weekly review with your old system. Confirm coaching notes, playbooks and supporting files have been handled. Those records are not inferred from an item-progress report. Keep the old system until the operator has accepted the migration and the new process.

## What needs separate migration

Course files, videos, custom exercise code, assessment responses, CRM activity feeds, historical changes, automated rules, notifications, permissions and completion certificates are not imported. Source values stay as recorded values. Original files and evidence links need their own reviewed transfer. There is no live Salesforce connection.

`npm run enablement -- export --json` writes a complete local JSON archive, including raw source rows and audit events. It is for backup and inspection, not a promised one-click restore.

## Sources checked 16 October 2026

- [Salesforce Enablement report types](https://help.salesforce.com/s/articleView?id=sales.enablement_reports.htm&language=en_US&type=5).
- [Salesforce report CSV export](https://trailhead.salesforce.com/content/learn/projects/create-reports-and-dashboards-for-sales-and-marketing-managers/manage-reported-data).
- [Salesforce Enablement developer resources](https://developer.salesforce.com/docs/sales/enablement/references/enablement-resources/enablement-developer-tools.html).
