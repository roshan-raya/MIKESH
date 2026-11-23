'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { subjects } from '@/lib/study';
import { availablePractice, type ExamTemplate, type Inventory } from '@/lib/practice-options';

const modes = {
  diagnostic: 'Core diagnostic',
  learn: 'Untimed learning',
  topic: 'Topic practice',
  adaptive: 'Mixed adaptive practice',
  timed: 'Timed section drill',
  mock: 'Full mock exam',
  review: 'Due review',
  writing: 'Timed essay',
};
type Mode = keyof typeof modes;
type Settings = {mode?:string;topic?:string;subject?:string};
const configurableModes = new Set<Mode>(['learn','topic','adaptive','timed','review']);

export default function Setup({inventory, templates, initial}: {inventory:Inventory;templates:ExamTemplate[];initial:Settings}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initial.mode && Object.hasOwn(modes,initial.mode) ? initial.mode as Mode : 'learn');
  const [subject, setSubject] = useState(initial.subject ?? '');
  const [topic, setTopic] = useState(initial.topic ?? '');
  const [desiredCount, setDesiredCount] = useState(8);
  const [science, setScience] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const configurable = configurableModes.has(mode);
  const subjectRequired = mode==='topic'||mode==='timed';
  const filtersReady = (!subjectRequired||Boolean(subject)) && (mode!=='topic'||Boolean(topic));
  const available = filtersReady ? availablePractice(inventory,mode,subject,topic) : 0;
  const sectionLimit = mode==='timed' ? templates.find(template=>template.subject===subject)?.question_count ?? 50 : 50;
  const maxCount = Math.min(sectionLimit,available);
  const count = Math.min(desiredCount,maxCount);
  const assessment = mode==='mock'||mode==='diagnostic';
  const sections = assessment ? templates.filter(template=>!template.optional||(mode==='mock'&&science&&template.subject==='SCIENCE')) : [];
  const needed = (template:ExamTemplate) => mode==='diagnostic'?3:template.question_count;
  const assessmentReady = sections.every(template=>(inventory.holdouts[template.subject]??0)>=needed(template));
  const canStart = !busy && (configurable ? filtersReady&&count>0 : assessmentReady);
  const topicOptions = Object.entries(inventory.practice[subject]??{}).sort(([a],[b])=>a.localeCompare(b));

  function changeMode(next:Mode) {
    setMode(next);
    if(next!=='topic'&&next!=='timed') setTopic('');
    setError('');
  }

  async function start(event: React.FormEvent) {
    event.preventDefault();
    if (!canStart) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/study', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({
        action:'start', mode, subject:configurable ? subject || null : null, topic:mode==='topic'||mode==='timed'?topic||null:null, count:configurable?count:8, science,
      })});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.push('/study/'+result.id);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not start the session.');
      setBusy(false);
    }
  }
  return <form onSubmit={start} className="stack">
    <label>Mode<select value={mode} onChange={e=>changeMode(e.target.value as Mode)}>{Object.entries(modes).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
    {configurable && <><label>Subject<select value={subject} required={subjectRequired} onChange={e=>{setSubject(e.target.value);setTopic('');setError('');}}>
      <option value="">{subjectRequired?'Choose a subject':'Mixed subjects'}</option>
      {subjects.map(s=><option key={s} value={s}>{s.toLowerCase()}</option>)}</select></label>
      {(mode==='topic'||(mode==='timed'&&subject)) && <label>Topic<select required={mode==='topic'} value={topic} onChange={e=>{setTopic(e.target.value);setError('');}}>
        <option value="">{mode==='topic'?'Choose a topic':'All topics'}</option>
        {topicOptions.map(([name,total])=><option key={name} value={name}>{name} ({total})</option>)}
      </select></label>}
      {filtersReady && <>
        {available>0 ? <p id="practice-availability" className="muted">{available} {mode==='review'?'due':'available'} {available===1?'question':'questions'} for this selection.</p>
          : <p className="muted">{mode==='review'?'No questions are due for this selection.':'There are no questions for this selection yet. Try another subject or topic.'}</p>}
        {maxCount>0 && <label>Number of questions<input type="number" min={1} max={maxCount} value={count}
          aria-describedby="practice-availability" onChange={e=>setDesiredCount(e.target.valueAsNumber||1)} required/></label>}
        {mode==='topic' && available<8 && <div><button type="button" onClick={()=>changeMode('learn')}>Practice all {subject.toLowerCase()} topics</button></div>}
      </>}
    </>}
    {mode==='diagnostic' && <p className="muted">Answer nine unseen questions across English, Math, and Reading. Results give an initial skill baseline.</p>}
    {mode==='mock' && <label className="inline-field"><input type="checkbox" checked={science} onChange={e=>setScience(e.target.checked)}/> Include Science</label>}
    {assessment && <ul className="rows" aria-label="Unseen question availability">
      {sections.map(template=><li key={template.subject}>{template.subject.toLowerCase()} · {inventory.holdouts[template.subject]??0} unseen · {needed(template)} needed</li>)}
    </ul>}
    {assessment && !assessmentReady && <p>There aren’t enough unseen questions to start this assessment. <Link href="https://www.act.org/content/act/en/products-and-services/the-act/test-preparation/free-act-test-prep.html">Open official ACT practice forms</Link>.</p>}
    {error && <p role="alert">{error}</p>}
    <button className="primary" disabled={!canStart}>{busy?'Starting…':configurable&&count>0?`Start ${count}-question session`:'Start session'}</button>
  </form>;
}
