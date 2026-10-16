import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv} from './lib/csv.mjs';
import {table} from './lib/format.mjs';

export const archiveTables=['reps','programs','milestones','enrolments','progress','coaching','playbooks','source_rows','audit_events','schema_migrations'];
const specs={
 help:[],reps:[],programs:[],program:['program'],milestones:['program'],
 'ramp-review':[],'milestone-check':[],'coaching-queue':[],playbooks:[],attention:[],'weekly-review':[],compliance:[],history:[],'imported-progress':[],
 'add-rep':['name','manager','team','purpose','review-on'], 'review-rep':['rep','purpose','review-on'],
 'add-program':['name','owner','objective'], 'add-milestone':['program','name','kind','target','unit','day-offset'],
 enrol:['program','rep','started-on','due-on'], 'log-progress':['enrolment','milestone','value','evidence','checked-on'],
 'complete-program':['enrolment'], 'reopen-program':['enrolment','reason'], 'set-program':['program','owner','objective'], 'schedule-coaching':['rep','coach','topic','due-on'], 'close-coaching':['coaching','outcome'],
 'add-playbook':['name','owner','location','evidence','review-on'], 'review-playbook':['playbook','evidence','review-on'],
 import:['file','map','namespace','owner'], export:[], 'draft-coaching':['coaching']
};
export const commands=Object.keys(specs);
export const readCommands=commands.slice(0,14);
const mutations=new Set(commands.filter(c=>!readCommands.includes(c)&&!['export','draft-coaching'].includes(c)));
export function parse(args){
 const c=args[0]||'help';if(!specs[c])throw Error(`Unknown command ${c}. Use help.`);
 const opts={};let vendor;
 for(const arg of args.slice(1)){
  if(c==='import'&&!vendor&&!arg.startsWith('--')){vendor=arg;continue;}
  if(!arg.startsWith('--'))throw Error(`Unexpected argument ${arg}`);
  const i=arg.indexOf('=');const k=arg.slice(2,i<0?undefined:i);const v=i<0?true:arg.slice(i+1);
  if(Object.hasOwn(opts,k))throw Error(`Duplicate flag ${k}`);
  if(![...specs[c],'json',...(mutations.has(c)?['actor','dry-run']:[])].includes(k))throw Error(`Unknown flag --${k} for ${c}`);
  if(['json','dry-run'].includes(k)?v!==true:typeof v!=='string'||!v.trim())throw Error(`Invalid value for --${k}`);
  opts[k]=typeof v==='string'?v.trim():v;
 }
 if(c==='import'&&vendor!=='salesforce')throw Error('Use import salesforce');
 for(const k of specs[c])if(!opts[k])throw Error(`Required --${k}=...`);
 if(mutations.has(c)&&!opts.actor)throw Error('Required --actor=operator');
 return {c,o:opts};
}
export function date(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v+'T00:00:00Z'))||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)throw Error(`Invalid date ${v}; use YYYY-MM-DD`);return v;}
const today=()=>new Date().toISOString().slice(0,10);
function number(v,min=0,integer=false){if(!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(String(v))||!Number.isFinite(Number(v))||Number(v)<min||Number(v)>999999999999.99||(integer&&!Number.isInteger(Number(v))))throw Error(`Invalid number ${v}`);return Number(v);}
function choice(v,allowed){if(!allowed.includes(v))throw Error(`Expected ${allowed.join('|')}`);return v;}
const one=async(db,q,p=[])=> (await db.query(q,p))[0];
const insert=async(db,t,data)=>one(db,`insert into ${t} (${Object.keys(data).join(',')}) values (${Object.keys(data).map((_,i)=>'$'+(i+1)).join(',')}) returning *`,Object.values(data));
export async function resolve(db,t,value,where='true',params=[]){
 const rows=await db.query(`select * from ${t} where ${where} order by id`,params);
 const label=r=>r.name||r.topic||`${r.rep_id} / ${r.program_id}`;
 const exact=rows.filter(r=>r.id===value||String(label(r)).toLowerCase()===value.toLowerCase());
 const matches=exact.length?exact:rows.filter(r=>r.id.startsWith(value.toLowerCase())||String(label(r)).toLowerCase().includes(value.toLowerCase()));
 if(matches.length!==1)throw Error(`${matches.length?'Ambiguous':'No match'} ${t}: ${value}. Candidates: ${ (matches.length?matches:rows).map(r=>r.id+' '+label(r)).join('; ')}`);
 return matches[0];
}
const queries={
 reps:'select * from reps order by name',programs:'select * from program_summary order by name',
 'ramp-review':'select rep,program,tasks,achieved,overdue,unverified,due_on,status from ramp_status order by overdue desc,rep',
 'milestone-check':'select rep,program,milestone,kind,verified_value,target,unit,due_on,achieved,overdue from milestone_status order by overdue desc,rep,milestone',
 'coaching-queue':"select c.id,r.name rep,c.coach,c.topic,c.due_on,c.due_on<current_date overdue,c.status from coaching c join reps r on r.id=c.rep_id where c.status='open' order by c.due_on,c.id",
 playbooks:'select *,review_on<current_date overdue from playbooks order by review_on,name',
 history:'select * from audit_events order by created_at,id',
 'imported-progress':'select s.namespace,s.source_key,r.name rep,p.name program,m.name milestone,s.reported_value,pr.verified_value from source_rows s join enrolments e on e.id=s.enrolment_id join reps r on r.id=e.rep_id join programs p on p.id=e.program_id join milestones m on m.id=s.milestone_id left join progress pr on pr.enrolment_id=e.id and pr.milestone_id=m.id order by s.namespace,s.source_key'
};
async function compliance(db){
 const rows=[];
 for(const r of await db.query("select * from reps where purpose='' or review_on is null or review_on<current_date"))rows.push({rule:'RETENTION_REVIEW',record:r.name,action:'Confirm lawful purpose and a review date',source:'https://www.privacy.org.nz/privacy-principles/9/'});
 for(const r of await db.query('select * from milestone_status where verified_value is null'))rows.push({rule:'UNVERIFIED_PROGRESS',record:`${r.rep}: ${r.milestone}`,action:'Check evidence before using progress in a personnel decision',source:'https://www.privacy.org.nz/privacy-principles/8/'});
 for(const r of await db.query('select * from playbooks where review_on<current_date'))rows.push({rule:'PLAYBOOK_REVIEW',record:r.name,action:'House control: review wording and supporting evidence',source:'docs/compliance.md#house-controls'});
 rows.push({rule:'MANUAL_SECURITY',record:'Operator review',action:'Check access, backups, exports and purpose before sharing. This check does not certify compliance.',source:'https://www.privacy.org.nz/privacy-principles/5/'});
 return rows;
}
async function attention(db){return {
 overdue:await db.query("select rep,program,milestone,due_on from milestone_status where overdue order by due_on,rep,milestone"),
 quiet:await db.query("select rep,program,last_checked_on from ramp_status where status='active' and coalesce(last_checked_on,started_on)<current_date-7 order by rep,program"),
 coaching:await db.query("select r.name rep,c.topic,c.due_on from coaching c join reps r on r.id=c.rep_id where status='open' and due_on<current_date order by due_on"),
 playbooks:await db.query('select name,owner,review_on from playbooks where review_on<current_date order by name')
};}
export async function dispatch(db,args){
 const {c,o}=parse(args);
 if(c==='help')return Object.entries(specs).map(([command,flags])=>({command,flags:flags.map(f=>`--${f}=...`).join(' ')+(mutations.has(command)?' --actor=... [--dry-run]':'')+(command==='import'?' (put salesforce before flags)':'')}));
 if(queries[c])return db.query(queries[c]);
 if(c==='program'){const p=await resolve(db,'programs',o.program);return {program:p,milestones:await db.query('select * from milestones where program_id=$1 order by day_offset,name',[p.id]),people:await db.query('select * from ramp_status where program_id=$1 order by rep',[p.id])};}
 if(c==='milestones'){const p=await resolve(db,'programs',o.program);return db.query('select * from milestones where program_id=$1 order by day_offset,name',[p.id]);}
 if(c==='attention')return attention(db);
 if(c==='compliance')return compliance(db);
 if(c==='weekly-review')return {ramp:await db.query(queries['ramp-review']),attention:await attention(db),coaching:await db.query(queries['coaching-queue']),checks:await compliance(db)};
 if(c==='export'){
  await db.exec('begin isolation level repeatable read');const records={};try{for(const t of archiveTables)records[t]=await db.query(`select * from ${t} order by ${t==='schema_migrations'?'name':'id'}`);await db.exec('commit');}catch(e){await db.exec('rollback');throw e;}
  const file=outFile('exports',`enablement-${Date.now()}.json`);fs.writeFileSync(file,JSON.stringify({format:'enablement-archive-v1',exported_at:new Date().toISOString(),records},null,2),{flag:'wx',mode:0o600});return {file,counts:Object.fromEntries(Object.entries(records).map(([k,v])=>[k,v.length]))};
 }
 if(c==='draft-coaching'){
  const r=await resolve(db,'coaching',o.coaching);const rep=await one(db,'select * from reps where id=$1',[r.rep_id]);
  const state=await db.query('select program,milestone,verified_value,target,unit,due_on from milestone_status where rep_id=$1 order by program,milestone',[rep.id]);
  const file=outFile('drafts',`coaching-${r.id}-${Date.now()}.md`);
  fs.writeFileSync(file,`# Internal coaching brief: ${rep.name}\n\nCoach: ${r.coach}\nTopic: ${r.topic}\nDue: ${r.due_on}\n\n${format(state)}\n\nDraft only. Check the evidence with the rep before making any personnel decision.\n`,{flag:'wx',mode:0o600});return {file};
 }
 await db.exec('begin');
 try{
  // Serialize CLI mutations so definitions and completion cannot race.
  await db.exec('lock table programs in share row exclusive mode');
  let result;
  if(c==='add-rep')result=await insert(db,'reps',{name:o.name,manager:o.manager,team:o.team,purpose:o.purpose,review_on:date(o['review-on'])});
  if(c==='review-rep'){const r=await resolve(db,'reps',o.rep);result=await one(db,'update reps set purpose=$1,review_on=$2 where id=$3 returning *',[o.purpose,date(o['review-on']),r.id]);}
  if(c==='add-program')result=await insert(db,'programs',{name:o.name,owner:o.owner,objective:o.objective});
  if(c==='add-milestone'){
   const p=await resolve(db,'programs',o.program);
   if(await one(db,'select id from enrolments where program_id=$1',[p.id]))throw Error('Program definitions are frozen after enrolment. Create a new program version.');
   result=await insert(db,'milestones',{program_id:p.id,name:o.name,kind:choice(o.kind,['exercise','milestone','outcome']),target:number(o.target,0.01),unit:o.unit,day_offset:number(o['day-offset'],0,true)});
  }
  if(c==='enrol'){
   const p=await resolve(db,'programs',o.program),r=await resolve(db,'reps',o.rep);const start=date(o['started-on']),due=date(o['due-on']);
   if(start>today())throw Error('Start date cannot be in the future');
   const m=await db.query('select * from milestones where program_id=$1',[p.id]);if(!m.length)throw Error('Define milestones before enrolment');
   if(m.some(x=>Date.parse(start)+x.day_offset*86400000>Date.parse(due)))throw Error('Program due date precedes a milestone');
   result=await insert(db,'enrolments',{program_id:p.id,rep_id:r.id,started_on:start,due_on:due});
  }
  if(c==='log-progress'){
   const e=await resolve(db,'enrolments',o.enrolment);if(e.status!=='active')throw Error('Program is already complete');
   const m=await resolve(db,'milestones',o.milestone,'program_id=$1',[e.program_id]);const checked=date(o['checked-on']);
   if(checked>today()||checked<e.started_on)throw Error('Evidence date must be within the enrolment and not in the future');
   result=await one(db,`insert into progress(program_id,enrolment_id,milestone_id,verified_value,evidence,actor,checked_on) values($1,$2,$3,$4,$5,$6,$7)
    on conflict(enrolment_id,milestone_id) do update set verified_value=excluded.verified_value,evidence=excluded.evidence,actor=excluded.actor,checked_on=excluded.checked_on returning *`,[e.program_id,e.id,m.id,number(o.value),o.evidence,o.actor,checked]);
  }
  if(c==='complete-program'){
   const e=await resolve(db,'enrolments',o.enrolment);if(e.status!=='active')throw Error('Program is already complete');
   const milestones=await db.query('select * from milestone_status where enrolment_id=$1',[e.id]);
   if(!milestones.length||milestones.some(m=>!m.achieved))throw Error('Every milestone needs verified evidence at or above target');
   result=await one(db,"update enrolments set status='complete',completed_at=now() where id=$1 returning *",[e.id]);
  }
  if(c==='reopen-program'){const e=await resolve(db,'enrolments',o.enrolment);if(e.status!=='complete')throw Error('Program is not complete');result=await one(db,"update enrolments set status='active',completed_at=null where id=$1 returning *",[e.id]);}
  if(c==='set-program'){const p=await resolve(db,'programs',o.program);result=await one(db,'update programs set owner=$1,objective=$2 where id=$3 returning *',[o.owner,o.objective,p.id]);}
  if(c==='schedule-coaching'){const r=await resolve(db,'reps',o.rep);result=await insert(db,'coaching',{rep_id:r.id,coach:o.coach,topic:o.topic,due_on:date(o['due-on'])});}
  if(c==='close-coaching'){const r=await resolve(db,'coaching',o.coaching);if(r.status!=='open')throw Error('Coaching is already closed');result=await one(db,"update coaching set status='done',outcome=$1,closed_at=now() where id=$2 returning *",[o.outcome,r.id]);}
  if(c==='add-playbook')result=await insert(db,'playbooks',{name:o.name,owner:o.owner,location:o.location,evidence:o.evidence,review_on:date(o['review-on'])});
  if(c==='review-playbook'){const p=await resolve(db,'playbooks',o.playbook);result=await one(db,'update playbooks set evidence=$1,review_on=$2 where id=$3 returning *',[o.evidence,date(o['review-on']),p.id]);}
  if(c==='import')result=await importSalesforce(db,o);
  if(result===undefined)throw Error(`No implementation for ${c}`);
  await insert(db,'audit_events',{actor:o.actor,action:c,detail:JSON.stringify({arguments:o,result})});
  await db.exec(o['dry-run']?'rollback':'commit');return o['dry-run']?{dry_run:true,result}:result;
 }catch(e){await db.exec('rollback');throw e;}
}
function outFile(dir,name){const d=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,dir);fs.mkdirSync(d,{recursive:true});return path.join(d,name);}
export function format(result){
 if(Array.isArray(result)){if(!result.length)return '  (none)';return table(result,Object.keys(result[0]).map(key=>({key,label:key,format:v=>v===null?'':typeof v==='object'?JSON.stringify(v):String(v)})));}
 if(result&&typeof result==='object')return Object.entries(result).map(([k,v])=>`${k}\n${typeof v==='object'&&v!==null?format(v):v}`).join('\n\n');
 return String(result);
}

// Reports have account-specific column labels. Explicit mapping prevents guessing.
const fields=['rep_id','rep_name','program_id','program_name','assignment_id','started_on','due_on','task_id','task_name','kind','target','unit','day_offset','reported_value'];
async function importSalesforce(db,o){
 const map=JSON.parse(fs.readFileSync(o.map,'utf8'));for(const f of fields)if(typeof map[f]!=='string'||!map[f])throw Error(`Mapping requires ${f}`);
 const rows=parseCsv(fs.readFileSync(o.file,'utf8'));if(!rows.length)throw Error('Empty export');
 const normalized=rows.map((raw,i)=>{
  const n={raw};for(const f of fields){if(!(map[f] in raw)||!raw[map[f]].trim())throw Error(`Row ${i+2}: missing ${map[f]}`);n[f]=raw[map[f]].trim();}
  date(n.started_on);date(n.due_on);if(n.started_on>today()||n.due_on<n.started_on)throw Error(`Row ${i+2}: invalid enrolment dates`);
  n.target=number(n.target,0.01);n.reported_value=number(n.reported_value);n.day_offset=number(n.day_offset,0,true);choice(n.kind,['exercise','milestone','outcome']);
  if(n.day_offset>3650||Date.parse(n.started_on)+n.day_offset*86400000>Date.parse(n.due_on))throw Error('Program due date precedes a milestone');
  n.key=JSON.stringify([n.assignment_id,n.task_id]);n.hash=createHash('sha256').update(JSON.stringify({raw:Object.fromEntries(Object.entries(raw).sort()),map:Object.fromEntries(Object.entries(map).sort())})).digest('hex');return n;
 });
 if(new Set(normalized.map(n=>n.key)).size!==normalized.length)throw Error('Duplicate assignment/task row in export');
 const ns=id=>JSON.stringify([o.namespace,id]);
 let imported=0,skipped=0;const fresh=[];
 for(const n of normalized){const old=await one(db,'select * from source_rows where namespace=$1 and source_key=$2',[o.namespace,n.key]);if(old){if(old.row_hash!==n.hash)throw Error('Changed source row: reconcile explicitly before re-importing');skipped++;}else fresh.push(n);}
 // Create and validate definitions before any enrolments are inserted.
 for(const n of fresh){
  let rep=await one(db,'select * from reps where external_id=$1',[ns(n.rep_id)]);
  if(!rep)rep=await insert(db,'reps',{external_id:ns(n.rep_id),name:n.rep_name});
  if(rep.name!==n.rep_name)throw Error('Conflicting rep name');n.rep=rep;
  let p=await one(db,'select * from programs where external_id=$1',[ns(n.program_id)]);
  if(!p)p=await insert(db,'programs',{external_id:ns(n.program_id),name:n.program_name,owner:o.owner,objective:'Imported program. Review the objective before use.'});
  if(p.name!==n.program_name)throw Error('Conflicting program name');n.program=p;
  let m=await one(db,'select * from milestones where program_id=$1 and external_id=$2',[p.id,ns(n.task_id)]);
  if(!m){if(await one(db,'select id from enrolments where program_id=$1',[p.id]))throw Error('Import cannot add tasks to an enrolled program. Reconcile the program version first');m=await insert(db,'milestones',{external_id:ns(n.task_id),program_id:p.id,name:n.task_name,kind:n.kind,target:n.target,unit:n.unit,day_offset:n.day_offset});}
  if(m.name!==n.task_name||m.kind!==n.kind||Number(m.target)!==n.target||m.unit!==n.unit||m.day_offset!==n.day_offset)throw Error('Conflicting milestone definition');n.milestone=m;
 }
 for(const n of fresh){
  let e=await one(db,'select * from enrolments where external_id=$1',[ns(n.assignment_id)]);
  if(!e)e=await insert(db,'enrolments',{external_id:ns(n.assignment_id),rep_id:n.rep.id,program_id:n.program.id,started_on:n.started_on,due_on:n.due_on});
  if(e.rep_id!==n.rep.id||e.program_id!==n.program.id||e.started_on!==n.started_on||e.due_on!==n.due_on)throw Error('Conflicting assignment');
  await insert(db,'source_rows',{namespace:o.namespace,source_key:n.key,row_hash:n.hash,raw:JSON.stringify(n.raw),enrolment_id:e.id,milestone_id:n.milestone.id,reported_value:n.reported_value});imported++;
 }
 return {imported,skipped,note:'Reported values are preserved, not verified. Review evidence before completing milestones. Raw export rows are retained.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 let db;try{const args=process.argv.slice(2);parse(args);db=await getDb();const result=await dispatch(db,args);console.log(args.includes('--json')?JSON.stringify(result,null,2):format(result));}catch(e){console.error(e.message);process.exitCode=1;}finally{await db?.close();}
}
