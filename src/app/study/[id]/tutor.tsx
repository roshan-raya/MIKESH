'use client';
import {useState} from 'react';
export default function Tutor({session,position,unlocked}:{session:string;position:number;unlocked:boolean}){
  const [question,setQuestion]=useState('');
  const [reply,setReply]=useState('');
  const [status,setStatus]=useState('');
  const [busy,setBusy]=useState(false);
  async function send(helpful?:boolean){
    setBusy(true);
    setStatus('');
    try{
      const response=await fetch('/api/tutor',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({session,position,question:question.trim()||undefined,helpful})});
      const result=await response.json();
      if(!response.ok) throw Error(result.error);
      if(typeof helpful==='boolean') setStatus('Feedback recorded.');
      else setReply(result.explanation);
    }catch(error){setStatus(error instanceof Error?error.message:'Tutor unavailable.');}
    finally{setBusy(false);}
  }
  return <details className="feedback"><summary>AI tutor</summary>
    <p className="muted">AI-generated guidance may contain errors. Check it against the worked solution.</p>
    {unlocked&&<label>Follow-up question<input maxLength={500} value={question} onChange={e=>setQuestion(e.target.value)}/></label>}
    <button disabled={busy} onClick={()=>void send()}>{busy?'Working…':unlocked?'Explain this solution':'Get a skill hint'}</button>
    {reply&&<><p className="preserve">{reply}</p><div className="toolbar"><button disabled={busy} onClick={()=>void send(true)}>Helpful</button><button disabled={busy} onClick={()=>void send(false)}>Needs correction</button></div></>}
    <p role="status">{status}</p>
  </details>;
}
