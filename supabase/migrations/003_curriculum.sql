begin;
create table public.subjects (
  code text primary key,
  title text not null,
  optional boolean not null,
  position integer not null unique
);
insert into public.subjects values
  ('ENGLISH','English',false,1), ('MATH','Math',false,2), ('READING','Reading',false,3),
  ('SCIENCE','Science',true,4), ('WRITING','Writing',true,5);
alter table public.exam_templates add foreign key (subject) references public.subjects(code);

create table public.topics (
  subject text references public.subjects(code),
  name text,
  reporting_category text,
  primary key(subject,name)
);
insert into public.topics(subject,name) select distinct subject,topic from public.questions;
alter table public.questions add foreign key (subject,topic) references public.topics(subject,name);

create function public.register_question_topic() returns trigger language plpgsql
set search_path=public,pg_catalog as $$
begin
  insert into topics(subject,name) values(new.subject,new.topic) on conflict do nothing;
  return new;
end
$$;
create trigger register_question_topic before insert on public.questions
for each row execute function public.register_question_topic();

create table public.lessons (
  slug text primary key,
  subject text not null,
  topic text not null,
  title text not null,
  strategy text not null,
  example text not null,
  checkpoint text not null,
  foreign key(subject,topic) references public.topics(subject,name)
);

create view public.skill_mastery with (security_invoker=true) as
select user_id,subject,topic,count(*) as samples,count(*) filter(where is_correct) as correct
from (
  select distinct on(a.user_id,coalesce(split_part(q.bank_key,'@',1),a.question_id::text))
    a.user_id,q.subject,q.topic,a.is_correct,a.selected_answer
  from public.attempts a join public.questions q on q.id=a.question_id
  where not q.holdout
  order by a.user_id,coalesce(split_part(q.bank_key,'@',1),a.question_id::text),a.created_at,a.id
) first_response
where selected_answer<>'Unanswered'
group by user_id,subject,topic;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.lessons enable row level security;
revoke all on public.subjects,public.topics,public.lessons,public.skill_mastery from anon,authenticated;
grant usage on schema public to service_role;
grant select on public.questions,public.passages,public.exam_templates,public.subjects,public.topics,
  public.lessons,public.skill_mastery,public.sessions,public.session_sections,public.session_questions,
  public.attempts,public.review_items,public.profiles,public.study_tasks,public.score_history,
  public.tutor_feedback to service_role;
grant insert,update on public.sessions,public.session_questions,public.attempts,public.review_items,
  public.profiles,public.study_tasks,public.tutor_feedback to service_role;
grant insert on public.session_sections,public.score_history to service_role;
grant delete on public.study_tasks to service_role;
insert into public.topics(subject,name,reporting_category) values ('ENGLISH','Purpose and relevance','Production of Writing'), ('ENGLISH','Organization','Production of Writing'), ('ENGLISH','Transitions','Production of Writing') on conflict(subject,name) do update set reporting_category=excluded.reporting_category;
insert into public.topics(subject,name,reporting_category) values ('ENGLISH','Word choice','Knowledge of Language'), ('ENGLISH','Concision','Knowledge of Language'), ('ENGLISH','Tone and style','Knowledge of Language') on conflict(subject,name) do update set reporting_category=excluded.reporting_category;
insert into public.topics(subject,name,reporting_category) values ('ENGLISH','Punctuation','Conventions of Standard English'), ('ENGLISH','Subject-verb agreement','Conventions of Standard English'), ('ENGLISH','Pronouns','Conventions of Standard English'), ('ENGLISH','Verb tense','Conventions of Standard English'), ('ENGLISH','Modifiers','Conventions of Standard English'), ('ENGLISH','Sentence boundaries','Conventions of Standard English'), ('ENGLISH','Parallel structure','Conventions of Standard English') on conflict(subject,name) do update set reporting_category=excluded.reporting_category;
insert into public.topics(subject,name,reporting_category) values ('MATH','Ratios and units','Number & Quantity'), ('MATH','Exponents and radicals','Number & Quantity'), ('MATH','Number and quantity','Number & Quantity'), ('MATH','Complex numbers','Number & Quantity'), ('MATH','Vectors and matrices','Number & Quantity') on conflict(subject,name) do update set reporting_category=excluded.reporting_category;
insert into public.topics(subject,name,reporting_category) values ('MATH','Linear equations','Algebra'), ('MATH','Systems and inequalities','Algebra'), ('MATH','Quadratics','Algebra'), ('MATH','Polynomial and rational expressions','Algebra'), ('MATH','Logarithms','Algebra') on conflict(subject,name) do update set reporting_category=excluded.reporting_category;
insert into public.topics(subject,name,reporting_category) values ('MATH','Functions','Functions'), ('MATH','Graphs and transformations','Functions'), ('MATH','Sequences','Functions'), ('MATH','Domain and range','Functions'), ('MATH','Trigonometric functions','Functions') on conflict(subject,name) do update set reporting_category=excluded.reporting_category;
insert into public.topics(subject,name,reporting_category) values ('MATH','Geometry','Geometry'), ('MATH','Coordinate geometry','Geometry'), ('MATH','Triangles and trigonometry','Geometry'), ('MATH','Circles','Geometry'), ('MATH','Volume and surface area','Geometry') on conflict(subject,name) do update set reporting_category=excluded.reporting_category;
insert into public.topics(subject,name,reporting_category) values ('MATH','Statistics and probability','Statistics & Probability'), ('MATH','Data distributions','Statistics & Probability'), ('MATH','Conditional probability','Statistics & Probability'), ('MATH','Counting methods','Statistics & Probability') on conflict(subject,name) do update set reporting_category=excluded.reporting_category;
insert into public.topics(subject,name,reporting_category) values ('MATH','Percentages','Integrating Essential Skills'), ('MATH','Rates','Integrating Essential Skills'), ('MATH','Proportional reasoning','Integrating Essential Skills'), ('MATH','Multistep quantities','Integrating Essential Skills') on conflict(subject,name) do update set reporting_category=excluded.reporting_category;
insert into public.topics(subject,name,reporting_category) values ('MATH','Modeling','Modeling'), ('MATH','Interpret model parameters','Modeling'), ('MATH','Test assumptions','Modeling') on conflict(subject,name) do update set reporting_category=excluded.reporting_category;
insert into public.topics(subject,name,reporting_category) values ('READING','Main idea','Key Ideas and Details'), ('READING','Details','Key Ideas and Details'), ('READING','Inference','Key Ideas and Details'), ('READING','Sequence and cause','Key Ideas and Details') on conflict(subject,name) do update set reporting_category=excluded.reporting_category;
insert into public.topics(subject,name,reporting_category) values ('READING','Text structure','Craft and Structure'), ('READING','Vocabulary in context','Craft and Structure'), ('READING','Point of view','Craft and Structure'), ('READING','Purpose and tone','Craft and Structure') on conflict(subject,name) do update set reporting_category=excluded.reporting_category;
insert into public.topics(subject,name,reporting_category) values ('READING','Comparisons','Integration of Knowledge and Ideas'), ('READING','Evidence','Integration of Knowledge and Ideas'), ('READING','Claims and reasoning','Integration of Knowledge and Ideas'), ('READING','Paired passages','Integration of Knowledge and Ideas') on conflict(subject,name) do update set reporting_category=excluded.reporting_category;
insert into public.topics(subject,name,reporting_category) values ('SCIENCE','Interpreting data','Interpretation of Data'), ('SCIENCE','Graphs and tables','Interpretation of Data'), ('SCIENCE','Interpolation','Interpretation of Data'), ('SCIENCE','Translate representations','Interpretation of Data') on conflict(subject,name) do update set reporting_category=excluded.reporting_category;
insert into public.topics(subject,name,reporting_category) values ('SCIENCE','Experimental design','Scientific Investigation'), ('SCIENCE','Controls and variables','Scientific Investigation'), ('SCIENCE','Predict additional trials','Scientific Investigation') on conflict(subject,name) do update set reporting_category=excluded.reporting_category;
insert into public.topics(subject,name,reporting_category) values ('SCIENCE','Conflicting viewpoints','Evaluating Scientific Arguments and Models with Evidence'), ('SCIENCE','Model predictions','Evaluating Scientific Arguments and Models with Evidence'), ('SCIENCE','Evaluate conclusions','Evaluating Scientific Arguments and Models with Evidence') on conflict(subject,name) do update set reporting_category=excluded.reporting_category;
insert into public.topics(subject,name,reporting_category) values ('WRITING','Analyze perspectives','Ideas and Analysis') on conflict(subject,name) do update set reporting_category=excluded.reporting_category;
insert into public.topics(subject,name,reporting_category) values ('WRITING','Develop reasoning','Development and Support') on conflict(subject,name) do update set reporting_category=excluded.reporting_category;
insert into public.topics(subject,name,reporting_category) values ('WRITING','Organize an argument','Organization') on conflict(subject,name) do update set reporting_category=excluded.reporting_category;
insert into public.topics(subject,name,reporting_category) values ('WRITING','Use precise language','Language Use and Conventions') on conflict(subject,name) do update set reporting_category=excluded.reporting_category;
insert into public.lessons(slug,subject,topic,title,strategy,example,checkpoint) values ('sentence-boundaries','ENGLISH','Punctuation','Join independent clauses','Read each side of the proposed punctuation on its own. If both sides can stand alone, choose a period, a semicolon, or a comma with a coordinating conjunction.','“The buses stopped; the roads had flooded.” Both halves are complete sentences.','Explain why a comma alone would create a comma splice.');
insert into public.lessons(slug,subject,topic,title,strategy,example,checkpoint) values ('functions','MATH','Functions','Read a quadratic’s minimum','Rewrite an upward-opening quadratic as a square plus a constant. The square is at least zero, so the constant gives the minimum.','$x^2-6x+13=(x-3)^2+4$. The minimum is 4, attained at x = 3.','Which part of the vertex form tells you where the minimum occurs?');
insert into public.lessons(slug,subject,topic,title,strategy,example,checkpoint) values ('inference','READING','Inference','Find the smallest supported inference','Underline the exact words that support the choice. Eliminate choices that add a cause, emotion, or certainty without textual support.','“Inez silently set aside the route she had drawn and followed the new trail signs.” You can infer she changed her planned route.','Which words support the change? Does the sentence reveal how Inez felt about it?');
insert into public.lessons(slug,subject,topic,title,strategy,example,checkpoint) values ('experiment','SCIENCE','Experimental design','Identify the comparison that isolates a variable','Find two trials with different levels of the variable being tested and the same levels of other conditions. Compare those outcomes first.','To test fertilizer, compare plants of the same species grown under equal light and water with different fertilizer amounts.','What changes if the fertilized group also gets more light?');
insert into public.lessons(slug,subject,topic,title,strategy,example,checkpoint) values ('essay','WRITING','Analyze perspectives','Connect a claim to a competing perspective','State your position and name a credible competing view. Identify the assumption on which you disagree, then use a specific example to explain the practical effect.','You might agree that longer library hours increase access while arguing that staff coverage matters more in neighborhoods where the building already opens late.','Can you state what the competing view gets right before you explain where it falls short?');
commit;
