'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { RichText } from '@/components/rich-text';

const ProgressContext=createContext<{completed:ReadonlySet<string>;complete:(id:string)=>void}>({
  completed:new Set(),complete:()=>{},
});
export function CourseProgress({initial,children}:{initial:string[];children:React.ReactNode}){
  const [completed,setCompleted]=useState(()=>new Set(initial));
  function complete(id:string){
    setCompleted(previous=>previous.has(id)?previous:new Set([...previous,id]));
  }
  return <ProgressContext.Provider value={{completed,complete}}>{children}</ProgressContext.Provider>;
}
export function GuidedCount({total}:{total:number}){
  const {completed}=useContext(ProgressContext);
  return <span>{completed.size} of {total} guided exercises completed</span>;
}
export function GuidedDone({id}:{id:string}){
  return useContext(ProgressContext).completed.has(id)?' · Done':null;
}

export function Guided({course,lesson,prompt,hint,choices}:{
  course:string;lesson:string;prompt:string;hint:string;choices:readonly string[];
}) {
  const {complete}=useContext(ProgressContext);
  const [choice,setChoice]=useState<number|null>(null);
  const [response,setResponse]=useState<{correct:boolean;feedback:string}|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);

  async function check(event:React.FormEvent) {
    event.preventDefault();
    if(choice===null||busy) return;
    setBusy(true);
    setError('');
    try{
      const res=await fetch('/api/learn',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({course,lesson,choice})});
      const result=await res.json();
      if(!res.ok) throw Error(result.error);
      setResponse(result);
      if(result.correct) complete(lesson);
    }catch(error){
      setError(error instanceof Error?error.message:'Could not check the answer.');
    }finally{setBusy(false);}
  }

  return <form onSubmit={check} className="stack">
    <p><RichText value={prompt}/></p>
    <details><summary>Show a hint</summary><p><RichText value={hint}/></p></details>
    <fieldset className="stack"><legend>Choose an answer</legend>
      {choices.map((option,index)=><label className="option" key={option}>
        <input type="radio" name={'guided-'+lesson} checked={choice===index} onChange={()=>setChoice(index)}/>
        <RichText value={option}/>
      </label>)}
    </fieldset>
    <div><button className="primary" disabled={busy||choice===null}>{busy?'Checking…':'Check answer'}</button></div>
    {response&&<p role="status"><strong>{response.correct?'Correct. ':'Try again. '}</strong><RichText value={response.feedback}/></p>}
    {error&&<p role="alert">{error}</p>}
  </form>;
}

export function Scratchpad({storageKey}:{storageKey:string}) {
  const [text,setText]=useState('');
  const [stored,setStored]=useState(true);
  useEffect(()=>{
    try{setText(window.localStorage.getItem(storageKey)??'');}
    catch{setStored(false);}
  },[storageKey]);
  return <details className="panel"><summary>Scratchpad</summary>
    <label>Working notes<textarea rows={7} maxLength={6000} value={text} onChange={event=>{
      setText(event.target.value);
      try{window.localStorage.setItem(storageKey,event.target.value);}
      catch{setStored(false);}
    }}/></label>
    <p className="muted">{stored?'Notes are saved in this browser.':'Browser storage is unavailable. Copy your notes before leaving.'}</p>
  </details>;
}
