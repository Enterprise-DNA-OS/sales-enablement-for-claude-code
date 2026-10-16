create function touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create function immutable_history() returns trigger language plpgsql as $$ begin raise exception 'History is append-only'; end $$;
create table reps (
 id uuid primary key default gen_random_uuid(), external_id text unique, name text not null check(length(trim(name))>0),
 manager text not null default '', team text not null default '', purpose text not null default '', review_on date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table programs (
 id uuid primary key default gen_random_uuid(), external_id text unique, name text not null check(length(trim(name))>0),
 owner text not null check(length(trim(owner))>0), objective text not null check(length(trim(objective))>0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table milestones (
 id uuid primary key default gen_random_uuid(), external_id text, program_id uuid not null references programs(id),
 name text not null check(length(trim(name))>0), kind text not null check(kind in ('exercise','milestone','outcome')),
 target numeric(14,2) not null check(target>0), unit text not null check(length(trim(unit))>0), day_offset integer not null check(day_offset between 0 and 3650),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(program_id,external_id), unique(program_id,name),unique(id,program_id)
);
create table enrolments (
 id uuid primary key default gen_random_uuid(), external_id text unique, rep_id uuid not null references reps(id), program_id uuid not null references programs(id),
 started_on date not null, due_on date not null, status text not null default 'active' check(status in ('active','complete')),
 completed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(due_on>=started_on),check((status='active' and completed_at is null) or (status='complete' and completed_at is not null)),unique(rep_id,program_id),unique(id,program_id)
);
create table progress (
 id uuid primary key default gen_random_uuid(), program_id uuid not null, enrolment_id uuid not null, milestone_id uuid not null,
 verified_value numeric(14,2) not null check(verified_value>=0), evidence text not null check(length(trim(evidence))>0), actor text not null,
 checked_on date not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(enrolment_id,program_id) references enrolments(id,program_id),foreign key(milestone_id,program_id) references milestones(id,program_id),unique(enrolment_id,milestone_id)
);
create table coaching (
 id uuid primary key default gen_random_uuid(), rep_id uuid not null references reps(id), coach text not null check(length(trim(coach))>0),
 topic text not null check(length(trim(topic))>0), due_on date not null, status text not null default 'open' check(status in ('open','done')),
 outcome text not null default '', closed_at timestamptz, created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 check((status='open' and closed_at is null) or (status='done' and closed_at is not null and length(trim(outcome))>0))
);
create table playbooks (
 id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name))>0), owner text not null check(length(trim(owner))>0),
 location text not null, evidence text not null, review_on date not null,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table source_rows (
 id uuid primary key default gen_random_uuid(), namespace text not null, source_key text not null, row_hash text not null, raw jsonb not null,
 enrolment_id uuid not null references enrolments(id), milestone_id uuid not null references milestones(id), reported_value numeric(14,2) not null check(reported_value>=0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(namespace,source_key)
);
create table audit_events (
 id uuid primary key default gen_random_uuid(), actor text not null, action text not null, detail jsonb not null,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
do $$ declare t text; begin
 foreach t in array array['reps','programs','milestones','enrolments','progress','coaching','playbooks','source_rows','audit_events'] loop
 execute format('create trigger updated before update on %I for each row execute function touch_updated_at()',t);
 execute format('alter table %I enable row level security',t);execute format('revoke all on %I from public',t);
 end loop;
 foreach t in array array['source_rows','audit_events'] loop
 execute format('create trigger immutable before update or delete on %I for each row execute function immutable_history()',t);
 end loop;
end $$;
create view milestone_status with (security_invoker=true) as
select e.id enrolment_id,m.id milestone_id,r.id rep_id,p.id program_id,r.name rep,p.name program,m.name milestone,m.kind,m.unit,m.target,
 e.started_on+m.day_offset due_on,e.status enrolment_status,pr.verified_value,pr.checked_on,pr.evidence,
 coalesce(pr.verified_value>=m.target,false) achieved,
 (e.status='active' and e.started_on+m.day_offset<current_date and coalesce(pr.verified_value<m.target,true)) overdue
from enrolments e join reps r on r.id=e.rep_id join programs p on p.id=e.program_id join milestones m on m.program_id=p.id
left join progress pr on pr.enrolment_id=e.id and pr.milestone_id=m.id;
create view ramp_status with (security_invoker=true) as
select e.id,e.rep_id,e.program_id,r.name rep,r.manager,r.team,p.name program,e.started_on,e.due_on,e.status,
 count(m.milestone_id)::integer tasks,count(m.milestone_id) filter(where m.achieved)::integer achieved,
 count(m.milestone_id) filter(where m.overdue)::integer overdue,
 count(m.milestone_id) filter(where m.verified_value is null)::integer unverified,
 max(m.checked_on) last_checked_on,
 (e.status='active' and e.due_on<current_date) program_overdue
from enrolments e join reps r on r.id=e.rep_id join programs p on p.id=e.program_id
left join milestone_status m on m.enrolment_id=e.id group by e.id,r.id,p.id;
create view program_summary with (security_invoker=true) as
select p.id,p.name,p.owner,p.objective,count(r.id)::integer enrolled,
 count(r.id) filter(where r.status='complete')::integer completed,
 coalesce(sum(r.overdue),0)::integer overdue_milestones,
 coalesce(sum(r.unverified),0)::integer unverified_milestones
from programs p left join ramp_status r on r.program_id=p.id group by p.id;
