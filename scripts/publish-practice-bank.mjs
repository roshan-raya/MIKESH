import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { createClient } from '@supabase/supabase-js';

const file = process.argv[2];
if (!file) throw Error('Pass the path to a new question batch.');
const data = JSON.parse(execFileSync(process.execPath,['scripts/bank.mjs',file,'--rows'],{encoding:'utf8'}));
const env = parseEnv(readFileSync('.env.local','utf8'));
const serverKey = process.env.SUPABASE_SECRET_KEY || env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!serverKey) throw Error('The Supabase server credential is missing.');
if (data.questions.some(q=>q.bank_key.startsWith('mock-')&&q.status!=='draft')) {
  throw Error('Mock form items must remain drafts until an assessment has passed editorial review.');
}
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL,serverKey,{
  auth:{autoRefreshToken:false,persistSession:false},
});
const slugs = [...new Set(data.questions.map(question=>question.passage).filter(Boolean))];
const passageIds = new Map();
if (data.passages.length) {
  const {error} = await db.from('passages').upsert(data.passages.map(p=>({...p,figure:p.figure??null})),
    {onConflict:'slug',ignoreDuplicates:true});
  if (error) throw Error('Could not insert passages ('+error.code+').');
}
if (slugs.length) {
  const {data:passages,error}=await db.from('passages').select('id,slug').in('slug',slugs);
  if (error) throw Error('Could not load passage IDs ('+error.code+').');
  for (const passage of passages) passageIds.set(passage.slug,passage.id);
  if (passageIds.size!==slugs.length) throw Error('One or more passages are missing.');
}

if (data.questions.some(q=>q.version!==1)) throw Error('Publish revised items through the SQL importer.');
const questions = data.questions.map(({passage,...q})=>({...q,passage_id:passage?passageIds.get(passage):null}));
const {error} = await db.from('questions').upsert(questions,{onConflict:'bank_key',ignoreDuplicates:true});
if (error) throw Error('Could not insert questions ('+error.code+').');
const {data:published,error:checkError} = await db.from('questions').select('bank_key,status,holdout,subject')
  .in('bank_key',questions.map(q=>q.bank_key));
if (checkError||published.length!==questions.length) throw Error('Could not confirm the complete batch.');
const indexed = new Map(published.map(q=>[q.bank_key,q]));
if (questions.some(q=>{
  const row=indexed.get(q.bank_key);
  return row.status!==q.status||row.holdout!==q.holdout||row.subject!==q.subject;
})) throw Error('Existing rows do not match the intended batch status or pool.');
console.log(`Verified ${published.length} bank entries, including ${published.filter(q=>q.holdout).length} holdouts.`);
