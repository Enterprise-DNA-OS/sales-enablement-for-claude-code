# Sales Enablement for Claude Code

Read README.md, docs/compliance.md and the matching .claude/commands file before work. One business, trusted operators. Business answers start with current CLI output. Demo records are fictional.

## Routing

Use npm run enablement -- help for exact flags.

| Recurring job | Command |
|---|---|
| List the people whose coaching records are held. | /reps |
| Compare assignments, completions and missing evidence across programs. | /programs |
| Read the complete program definition and its people. | /program |
| Read targets, units and days from enrolment before interpreting progress. | /milestones |
| Review the progress and overdue work for each rep. | /ramp-review |
| Find the exact task and evidence behind each progress count. | /milestone-check |
| Review open coaching actions and their owners. | /coaching-queue |
| Check playbook owners and review dates. | /playbooks |
| Find overdue work, stale playbooks and quiet assignments. | /attention |
| Write the Monday enablement review from current records. | /weekly-review |
| Review privacy record checks and house controls. Never claim certification. | /compliance |
| Read recorded mutations and the evidence supplied by operators. | /history |
| Compare source values with locally verified evidence. | /imported-progress |
| Add a rep only with a supplied name, manager, team, lawful purpose and review date. | /add-rep |
| Record the operator-confirmed retention purpose and review date. | /review-rep |
| Define the program objective and owner. | /add-program |
| Define an exercise, milestone or outcome before anyone enrols. | /add-milestone |
| Change a program owner or objective while preserving milestone definitions. | /set-program |
| Assign a rep after checking the definition and dates. | /enrol |
| Record an absolute value supported by evidence. Do not add to the prior value. | /log-progress |
| Complete an assignment only after every task has verified evidence. | /complete-program |
| Reopen a mistaken completion with the operator-supplied reason before correcting it. | /reopen-program |
| Record the coach, topic and agreed follow-up date. | /schedule-coaching |
| Record the actual outcome of a coaching action. | /close-coaching |
| Register an existing playbook and its review evidence. | /add-playbook |
| Record a completed review of playbook wording. | /review-playbook |
| Import a prepared Salesforce item-progress CSV using an explicit mapping. | /import |
| Write a complete local archive of records and audit history. | /export |
| Write an internal coaching brief to drafts. Never send it. | /draft-coaching |
| Show exact CLI syntax. | /help |
| Change a field or rule through a tested migration | /customise |
| Add a read-only report | /new-view |

## Rules

Never invent a record, evidence, an observation, completion or a coaching outcome. Imported progress is reported history, not verified evidence. Check evidence with the operator before using progress in a personnel decision. Completion proves only that the recorded targets were met. No automatic employee rankings or causal revenue claims.

Read before writing. Every mutation requires the actual operator name and accepts a dry run. Do not bypass ambiguity or import conflicts. Definitions freeze after enrolment. A changed program is a new version. Correct a completed assignment by reopening it with a reason first.

Never send, publish or connect a live CRM from here. Drafts stay local. Do not delete records without a specific operator instruction and retention plan covering backups and audit history. Never expose the owner database connection to browsers. Access control is a separate deployment task.

## Files

scripts/enablement.mjs is the sole domain CLI. supabase/migrations holds forward migrations. views.json and documents.json define read-only output. brand.json controls the name, logo and colours. Commands live in .claude/commands for every runtime.

Omni by Enterprise DNA installs and operates your version: https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=salesforce-sales-programs
