insert into reps(id,name,manager,team,purpose,review_on) values
 ('10000000-0000-0000-0000-000000000001','Mara Chen','Alex Taylor','Auckland','Sales coaching',current_date+90),
 ('10000000-0000-0000-0000-000000000002','Theo Ward','Alex Taylor','Wellington','Sales coaching',current_date-5),
 ('10000000-0000-0000-0000-000000000003','Nina Patel','Jordan Ross','Melbourne','Sales coaching',current_date+60) on conflict do nothing;
insert into programs(id,name,owner,objective) values
 ('20000000-0000-0000-0000-000000000001','Discovery ramp','Alex Taylor','Verify discovery practice before a rep leads a customer call'),
 ('20000000-0000-0000-0000-000000000002','Renewal conversations','Jordan Ross','Record customer outcome evidence and prepare a renewal brief') on conflict do nothing;
insert into milestones(id,program_id,name,kind,target,unit,day_offset) values
 ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Review discovery guide','exercise',1,'review',2),
 ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','Practise discovery calls','milestone',3,'observed calls',7),
 ('30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000001','Qualify first opportunity','outcome',1,'qualified opportunity',14),
 ('30000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000002','Review renewal brief','exercise',1,'brief',3),
 ('30000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000002','Confirm customer outcome','outcome',2,'confirmed outcomes',10) on conflict do nothing;
insert into enrolments(id,rep_id,program_id,started_on,due_on) values
 ('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',current_date-20,current_date-6),
 ('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001',current_date-10,current_date+4),
 ('40000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000002',current_date-12,current_date-2) on conflict do nothing;
insert into progress(id,program_id,enrolment_id,milestone_id,verified_value,evidence,actor,checked_on) values
 ('50000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',1,'Fictional guide review record','Demo coach',current_date-18),
 ('50000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002',2,'Fictional observed call notes','Demo coach',current_date-15),
 ('50000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000004',1,'Fictional renewal brief review','Demo coach',current_date-9) on conflict do nothing;
insert into coaching(id,rep_id,coach,topic,due_on) values
 ('60000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Alex Taylor','Review the third discovery call',current_date-2),
 ('60000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','Alex Taylor','First practice session',current_date+2) on conflict do nothing;
insert into playbooks(id,name,owner,location,evidence,review_on) values
 ('70000000-0000-0000-0000-000000000001','Discovery guide','Alex Taylor','docs/demo-discovery-guide.md','Demo approved wording',current_date-3),
 ('70000000-0000-0000-0000-000000000002','Renewal brief','Jordan Ross','docs/demo-renewal-brief.md','Demo review evidence',current_date+60) on conflict do nothing;
