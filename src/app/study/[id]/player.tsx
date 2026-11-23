'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { remainingSeconds } from '@/lib/study';
import Tutor from './tutor';
import QuestionLearningPanel from '@/components/question-learning';
import type {QuestionLearning} from '@/lib/courses/question-learning';
import { RichText } from '@/components/rich-text';

type Figure = {caption:string; headings:string[]; rows:string[][]; kind?:'table'|'bars'}
  | {kind:'diagram';caption:string;description:string;shapes:{points:[number,number][];label:string;x:number;y:number}[]};

function PassageFigure({figure}:{figure:Figure}){
  if(figure.kind==='diagram') return <figure>
    <figcaption>{figure.caption}</figcaption>
    <svg className="study-diagram" viewBox="0 0 100 100" role="img" aria-label={figure.description}>
      {figure.shapes.map((shape,index)=><g key={index}>
        <polyline points={shape.points.map(point=>point.join(',')).join(' ')} fill="none" stroke="currentColor"/>
        <text x={shape.x} y={shape.y} fontSize="5" fill="currentColor">{shape.label}</text>
      </g>)}
    </svg>
  </figure>;
  const max=figure.kind==='bars'?Math.max(1,...figure.rows.map(row=>Number(row[1]))):1;
  return <table><caption>{figure.caption}</caption>
    <thead><tr>{figure.headings.map((heading,index)=><th key={index} scope="col">{heading}</th>)}</tr></thead>
    <tbody>{figure.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>
      {figure.kind==='bars'&&j===1&&<span className="study-bar" aria-hidden="true" style={{width:`${Number(cell)*100/max}%`}}/>}{cell}
    </td>)}</tr>)}</tbody>
  </table>;
}
export type Item = {
  position:number; answer:string|null; confidence:string|null; seconds:number; flagged:boolean;
  prompt:string; options:{id:string;text:string}[]; topic:string; subject:string;
  passage?:{title:string;body:string;figure?:Figure|null}|null;
  learning?:QuestionLearning;
  result?:{correct_answer:string;explanation:string;distractors:Record<string,string>};
};
export default function Player({id, section, mode, completed, deadline, essay: savedEssay, items, tutor}: {
  id:string; section:number; mode:string; completed:boolean; deadline:string|null; essay:string; items:Item[]; tutor:boolean;
}) {
  const router = useRouter();
  const [index,setIndex] = useState(0);
  const [drafts,setDrafts] = useState<Record<number,Partial<Item>>>({});
  const [essay,setEssay] = useState(savedEssay);
  const [now,setNow] = useState(0);
  const [status,setStatus] = useState('');
  const [busy,setBusy] = useState(false);
  const [confirm,setConfirm] = useState(false);
  const submitting = useRef(false);
  const pending = useRef(Promise.resolve(true));
  const failedSaves = useRef(new Map<number|string,Record<string,unknown>>());
  const [unsaved,setUnsaved] = useState(0);
  const entered = useRef(0);
  const questionHeading = useRef<HTMLHeadingElement>(null);
  const remaining = deadline && now ? remainingSeconds(deadline,now) : null;
  const expired = remaining === 0;
  const writable = !completed && !expired && !busy;
  const item = items[index] ? {...items[index],...drafts[items[index].position]} : undefined;
  const reveal = ['learn','topic','adaptive','review'].includes(mode);
  useEffect(()=>{
    entered.current=Date.now();
    const tick=()=>setNow(Date.now());
    const first=window.setTimeout(tick,0);
    const timer=window.setInterval(tick,1000);
    return ()=>{window.clearTimeout(first);window.clearInterval(timer);};
  },[index]);

  const send = useCallback((payload:Record<string,unknown>)=>{
    const saveKey=payload.action==='save'||payload.action==='check'
      ? (typeof payload.position==='number'?payload.position:'essay') : null;
    const request = pending.current.then(async ()=>{
      setStatus('Saving…');
      try {
        const res=await fetch('/api/study',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session:id,...payload})});
        if (!res.ok) throw new Error((await res.json()).error);
        if(saveKey!==null) failedSaves.current.delete(saveKey);
        setUnsaved(failedSaves.current.size);
        setStatus('Saved');
        return true;
      } catch (error) {
        if(saveKey!==null) failedSaves.current.set(saveKey,payload);
        setUnsaved(failedSaves.current.size);
        setStatus(error instanceof Error?error.message:'Save failed. Try again.');
        return false;
      }
    });
    pending.current=request;
    return request;
  },[id]);

  function save(change:Partial<Item>, action:'save'|'check'='save') {
    if (!item || !writable) return Promise.resolve(false);
    const next={...item,...change,seconds:Math.min(7200,item.seconds+Math.max(0,Math.round((Date.now()-entered.current)/1000)))};
    entered.current=Date.now();
    setDrafts(previous=>({...previous,[item.position]:{answer:next.answer,seconds:next.seconds,flagged:next.flagged,confidence:next.confidence}}));
    return send({action,position:next.position,answer:next.answer,confidence:next.confidence,flagged:next.flagged,seconds:next.seconds});
  }
  useEffect(()=>{
    if (completed || expired || mode!=='writing' || essay===savedEssay) return;
    const timer=window.setTimeout(()=>{void send({action:'save',essay});},500);
    return ()=>window.clearTimeout(timer);
  },[completed,expired,mode,essay,savedEssay,send]);

  function go(next:number) {
    if (next<0 || next>=items.length || next===index || busy) return;
    if (writable && item) void save({});
    setIndex(next);
    setConfirm(false);
    requestAnimationFrame(()=>questionHeading.current?.focus());
  }
  function shortcuts(event:React.KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT|BUTTON/.test((event.target as HTMLElement).tagName)) return;
    if (event.key==='ArrowLeft') { event.preventDefault(); go(index-1); }
    if (event.key==='ArrowRight') { event.preventDefault(); go(index+1); }
    const choice = item?.options[Number(event.key)-1];
    if (choice && writable && !item?.result) void save({answer:choice.id});
  }
  async function finish() {
    if(submitting.current) return;
    submitting.current=true;
    const saveRequest=expired ? pending.current : mode==='writing'
      ? send({action:'save',essay}) : save({});
    setBusy(true);
    try {
      await saveRequest;
      if (!expired && failedSaves.current.size) {
        const queued=[...failedSaves.current.values()];
        const retries=await Promise.all(queued.map(payload=>send(payload)));
        if (retries.some(saved=>!saved)) return;
      }
      if (await send({action:'submit',position:section})) router.refresh();
    } finally {
      submitting.current=false;
      setBusy(false);
    }
  }
  async function check() {
    const saved = save({},'check');
    setBusy(true);
    if (await saved) router.refresh();
    setBusy(false);
  }
  return <section className="stack" onKeyDown={shortcuts} tabIndex={0} aria-label="Question player">
    <div className="toolbar">
      {item && <span>{index+1} of {items.length} · {item.subject.toLowerCase()} · {item.topic}</span>}
      <span role="status">{status}</span>
      {remaining!==null && !completed && <strong className="timer" aria-label="Time remaining">{Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')}</strong>}
    </div>
    {expired && !completed && <p role="alert">Time is up. Submit the work saved before the deadline.</p>}
    {unsaved>0 && !completed && <p role="alert">{expired?'Some changes were not saved before the time limit.':'Some changes are still unsaved. Submission will retry them first.'}</p>}
    {mode==='writing' && !completed ? <div className="panel stack">
      <h2>Extending public library hours</h2>
      <p>A town can fund one change at its public library. Some residents want later hours for students and shift workers. Others want more staff during existing hours. A third group favors investing in digital access instead.</p>
      <p>Develop your position and analyze its relationship to at least one of these perspectives. Support your reasoning with examples.</p>
      <label>Your essay<textarea maxLength={25000} rows={14} disabled={!writable} value={essay} onChange={e=>setEssay(e.target.value)}/></label>
    </div> : item && <>
      <div className={item.passage?'split':'stack'}>
        {item.passage && <article className="panel"><h2>{item.passage.title}</h2><RichText value={item.passage.body}/>
          {item.passage.figure && <PassageFigure figure={item.passage.figure}/>}
        </article>}
        <article className="panel stack">
          <h2 ref={questionHeading} tabIndex={-1}><RichText value={item.prompt}/></h2>
          <p className="muted">{item.subject==='MATH'?'ACT-permitted calculator allowed.':'Calculator use is prohibited in this section.'}</p>
          <fieldset className="stack"><legend className="sr-only">Answer choices</legend>
            {item.options.map(option=><label className="option" key={option.id}>
              <input type="radio" name="answer" checked={item.answer===option.id} disabled={!writable||Boolean(item.result)} onChange={()=>void save({answer:option.id})}/>
              <span className="letter">{option.id}</span><RichText value={option.text}/>
            </label>)}
          </fieldset>
          {!completed && <div className="toolbar">
            <label className="inline-field"><input type="checkbox" checked={item.flagged} disabled={!writable} onChange={e=>void save({flagged:e.target.checked})}/> Mark for review</label>
            <label>Confidence<select value={item.confidence??''} disabled={!writable||Boolean(item.result)} onChange={e=>void save({confidence:e.target.value||null})}>
              <option value="">Choose</option><option value="sure">Sure</option><option value="unsure">Unsure</option><option value="guess">Guess</option>
            </select></label>
          </div>}
          {reveal && !completed && !item.result && <button className="primary" disabled={!writable||!item.answer} onClick={check}>Check answer</button>}
          {item.result && <div className="feedback stack"><strong>{item.answer===item.result.correct_answer?'Correct':item.answer?'Correct answer: '+item.result.correct_answer:'Unanswered · Correct answer: '+item.result.correct_answer}</strong>
            <p><RichText value={item.result.explanation}/></p>
            {item.answer&&item.result.distractors?.[item.answer]&&!item.learning?.feedback[item.answer]&&
              <p><RichText value={item.result.distractors[item.answer]}/></p>}
            {item.learning&&Object.keys(item.learning.feedback).length>0&&<details open={Boolean(item.learning.error)}>
              <summary>Why the other choices don’t work</summary>
              <ul className="rows">{item.options.filter(option=>item.learning?.feedback[option.id]).map(option=><li key={option.id}>
                <strong>{option.id}{option.id===item.answer?' · Your choice':''}</strong> <RichText value={item.learning!.feedback[option.id]}/>
              </li>)}</ul>
            </details>}
            {item.learning&&<QuestionLearningPanel key={item.position} learning={item.learning}/>}
          </div>}
          {tutor && (completed || reveal) && <Tutor key={item.position} session={id} position={item.position} unlocked={Boolean(item.result)}/>}
        </article>
      </div>
      <div className="toolbar" aria-label="Question palette"><button disabled={index===0} onClick={()=>go(index-1)}>Previous</button>
        <div className="palette">{items.map((q,i)=>{
          const state={...q,...drafts[q.position]};
          return <button key={q.position} aria-current={i===index?'step':undefined} data-answered={Boolean(state.answer)} aria-label={`Question ${i+1}${state.answer?', answered':''}${state.flagged?', flagged':''}`} onClick={()=>go(i)}>{i+1}{state.flagged?' ⚑':''}</button>;
        })}</div>
        <button disabled={index===items.length-1} onClick={()=>go(index+1)}>Next</button>
      </div>
      <p className="muted">With the player focused, use the left and right arrow keys to move and 1–5 to choose an answer.</p>
    </>}
    {!completed && <div className="toolbar">
      {!confirm ? <button className="primary" disabled={busy} onClick={()=>setConfirm(true)}>Submit {mode==='mock'||mode==='diagnostic'?'section':'session'}</button> :
        <><p>Submit saved responses and close this section?</p><button className="primary" disabled={busy} onClick={()=>{void finish();}}>Confirm submission</button><button onClick={()=>setConfirm(false)}>Keep working</button></>}
    </div>}
  </section>;
}
