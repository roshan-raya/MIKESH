'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {difficultyBands,type CourseInventory} from '@/lib/courses/options';

export default function CourseSession({slug,counts,mastery,focus}:{slug:string;counts:CourseInventory[];mastery:boolean;focus?:string}) {
  const router=useRouter();
  const topics=[...new Set(counts.map(row=>row.topic))];
  const [topic,setTopic]=useState('');
  const [band,setBand]=useState<keyof typeof difficultyBands>('all');
  const [size,setSize]=useState(6);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [low,high]=difficultyBands[band];
  const available=counts.filter(row=>(!topic||row.topic===topic)&&row.difficulty>=low&&row.difficulty<=high)
    .reduce((sum,row)=>sum+Number(mastery?row.unseen:row.total),0);
  const count=Math.min(size,available,20);

  async function start(event:React.FormEvent) {
    event.preventDefault();
    if(!count||busy) return;
    setError('');
    setBusy(true);
    try{
      const response=await fetch('/api/learn',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'start',course:slug,topic,band,count,mastery,focus})});
      const body=await response.json();
      if(!response.ok) throw Error(body.error);
      router.push('/study/'+body.id);
    }catch(error){
      setError(error instanceof Error?error.message:'Could not start this session.');
      setBusy(false);
    }
  }
  return <form onSubmit={start} className="stack">
    <label>Practice topic<select value={topic} onChange={e=>setTopic(e.target.value)}>
      <option value="">All linked topics</option>{topics.map(name=><option key={name}>{name}</option>)}
    </select></label>
    <label>Difficulty<select value={band} onChange={e=>setBand(e.target.value as keyof typeof difficultyBands)}>
      <option value="all">Mixed difficulty</option><option value="foundational">Foundational</option>
      <option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
    </select></label>
    <p>{available} {mastery?'unseen':'available'} {available===1?'question':'questions'}</p>
    {available>0&&<label>Questions<input type="number" min={1} max={Math.min(20,available)} value={count} required
      onChange={e=>setSize(e.target.valueAsNumber||1)}/></label>}
    {error&&<p role="alert">{error}</p>}
    <div><button className="primary" disabled={busy||count===0}>{busy?'Starting…':mastery?'Start unseen mastery check':'Start independent practice'}</button></div>
  </form>;
}
