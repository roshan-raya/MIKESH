import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';

const text = z.string().trim().min(1);
const slug = text.regex(/^[a-z][a-z0-9-]*$/);
const table = z.object({
  kind:z.enum(['table','bars']).optional(),caption:text,headings:z.array(text).min(1).max(10),rows:z.array(z.array(text)).min(1).max(30),
}).refine(f=>f.rows.every(row=>row.length===f.headings.length),'Table rows must match the headings.')
  .refine(f=>f.kind!=='bars'||(f.headings.length===2&&f.rows.every(row=>/^\d+(\.\d+)?$/.test(row[1]))),'Bar values must be nonnegative numbers.');
const coordinate=z.number().min(0).max(100);
const diagram=z.object({kind:z.literal('diagram'),caption:text,description:text,
  shapes:z.array(z.object({points:z.array(z.tuple([coordinate,coordinate])).min(2).max(20),
    label:text,x:coordinate,y:coordinate})).min(1).max(12)});
const figure=z.union([table,diagram]);
const passage = z.object({slug,title:text,body:text,figure:figure.optional()});
const item = z.object({
  slug, version:z.number().int().positive().default(1), subject:z.enum(['ENGLISH','MATH','READING','SCIENCE']), topic:text,
  difficulty:z.number().int().min(1).max(5), passage:slug.nullable().default(null), prompt:text,
  choices:z.array(text).min(4).max(5), correctIndex:z.number().int().min(0).max(4), explanation:text,
  holdout:z.boolean().default(false), status:z.enum(['draft','verified']).default('draft'),
  provenance:text, objective:text.optional(), subtopic:text.optional(), seconds:z.number().int().positive().default(60),
  tags:z.array(text).default([]), distractors:z.partialRecord(z.enum(['A','B','C','D','E']),text).default({}),
}).superRefine((q,context)=>{
  if(q.correctIndex>=q.choices.length || new Set(q.choices.map(s=>s.toLowerCase())).size!==q.choices.length)
    context.addIssue({code:'custom',message:'Use distinct choices and one in-range answer index.'});
  if(Object.keys(q.distractors).some(key=>!('ABCDE'.indexOf(key)<q.choices.length && 'ABCDE'.indexOf(key)!==q.correctIndex)))
    context.addIssue({code:'custom',message:'Distractor feedback must reference an incorrect choice.'});
});
const starter = 'content/starter.json';
const file = process.argv.slice(2).find(argument=>!argument.startsWith('--')) ?? starter;
const raw = readFileSync(file,'utf8');
const input = file.endsWith('.csv') ? {passages:[],items:parse(raw,{columns:true,skip_empty_lines:true,bom:true}).map(row=>{
  const {choices,tags,distractors,correctIndex,difficulty,version,seconds,holdout,...fields}=row;
  return {...Object.fromEntries(Object.entries(fields).filter(([,value])=>value!=='')),
    choices:JSON.parse(choices),tags:tags?JSON.parse(tags):undefined,distractors:distractors?JSON.parse(distractors):undefined,
    correctIndex:Number(correctIndex),difficulty:Number(difficulty),version:version?Number(version):undefined,
    seconds:seconds?Number(seconds):undefined,holdout:holdout?JSON.parse(holdout):undefined};
})} : JSON.parse(raw);
const passages = z.array(passage).parse(input.passages ?? []);
const compactItem = z.tuple([slug,z.string(),text,z.number(),slug.nullable(),text,z.array(text),z.number(),text]);
const rows = z.array(item).parse(input.items.map(entry=>{
  if(!Array.isArray(entry) || (file!==starter && input.format!=='authored-v1')) return entry;
  const [slug,subject,topic,difficulty,passage,prompt,choices,correctIndex,explanation]=compactItem.parse(entry);
  const holdout = file===starter ? slug.startsWith('hd') : input.holdout;
  return {slug,subject,topic,difficulty,passage,prompt,choices,correctIndex,explanation,holdout,
    status:file===starter?'verified':input.status??'verified',provenance:(file===starter?'Original ACT Mastery starter':'Original ACT Mastery practice content')+'; independent editorial review pending',objective:'Apply '+topic.toLowerCase()};
}));
const keys = new Set();
const prompts = new Set();
const passageKeys = new Set(passages.map(p=>p.slug));
if(passageKeys.size!==passages.length) throw new Error('Duplicate passage slug.');
for(const q of rows){
  const key=q.slug+'@'+q.version;
  const prompt=q.prompt.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'');
  if(q.slug.startsWith('chapter-practice-') && (q.status!=='draft'||q.holdout))
    throw new Error('Import chapter practice as drafts. Publish reviewed revisions through the owner release function: '+key);
  if(keys.has(key)||prompts.has(prompt)) throw new Error('Duplicate question: '+key);
  if(q.passage && !passageKeys.has(q.passage) && !file.endsWith('.csv')) throw new Error('Unknown passage: '+q.passage);
  keys.add(key);
  prompts.add(prompt);
}
if(process.argv.includes('--rows')){
  const questions=rows.map(q=>({
    bank_key:q.slug+'@'+q.version,version:q.version,subject:q.subject,topic:q.topic,subtopic:q.subtopic??null,
    objective:q.objective??null,prompt:q.prompt,options:q.choices.map((choice,index)=>({id:'ABCDE'[index],text:choice})),
    correct_answer:'ABCDE'[q.correctIndex],explanation:q.explanation,distractors:q.distractors,status:q.status,
    difficulty:q.difficulty,seconds:q.seconds,provenance:q.provenance,holdout:q.holdout,tags:q.tags,passage:q.passage,
  }));
  console.log(JSON.stringify({passages,questions}));
}else if(process.argv.includes('--sql')){
  const lit = value => value == null ? 'null' : "'"+String(value).replaceAll("'","''")+"'";
  const json = value => lit(JSON.stringify(value))+'::jsonb';
  console.log('begin;');
  console.log("set local standard_conforming_strings = on;");
  for(const p of passages) console.log(`insert into public.passages(slug,title,body,figure) values(${lit(p.slug)},${lit(p.title)},${lit(p.body)},${p.figure?json(p.figure):'null'}) on conflict(slug) do nothing;`);
  for(const q of rows){
    if(q.passage) console.log(`do $bank$ begin if not exists(select 1 from public.passages where slug=${lit(q.passage)}) then raise exception 'Unknown passage'; end if; end $bank$;`);
    const key=q.slug+'@'+q.version;
    const options=q.choices.map((choice,i)=>({id:'ABCDE'[i],text:choice}));
    const values=[lit(key),q.version,lit(q.subject),lit(q.topic),lit(q.subtopic),lit(q.objective),lit(q.prompt),json(options),lit('ABCDE'[q.correctIndex]),
      lit(q.explanation),json(q.distractors),lit(q.status),q.difficulty,q.seconds,lit(q.provenance),q.holdout,
      `array[${q.tags.map(lit).join(',')}]::text[]`,q.passage?`(select id from public.passages where slug=${lit(q.passage)})`:'null'];
    console.log(`insert into public.questions(bank_key,version,subject,topic,subtopic,objective,prompt,options,correct_answer,explanation,distractors,status,difficulty,seconds,provenance,holdout,tags,passage_id) values(${values.join(',')}) on conflict(bank_key) do update set status=excluded.status
      where excluded.status='verified' and
        to_jsonb(questions)-array['id','created_at','status'] = to_jsonb(excluded)-array['id','created_at','status'];`);
    if(q.status==='verified') {
      console.log(`update public.questions set status='draft' where status='verified' and split_part(bank_key,'@',1)=${lit(q.slug)} and version < (select max(version) from public.questions where status='verified' and split_part(bank_key,'@',1)=${lit(q.slug)});`);
    }
  }
  console.log('commit;');
}else console.log(`Validated ${rows.length} items, ${passages.length} passages and ${rows.filter(q=>q.holdout).length} holdouts. Review the answer and explanation for each item before publishing.`);
