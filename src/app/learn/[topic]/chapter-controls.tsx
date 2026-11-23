'use client';

import {useState} from 'react';

export function Bookmark({course,lesson,initial}:{course:string;lesson:string;initial:boolean}) {
  const [saved,setSaved]=useState(initial);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  async function toggle(){
    setBusy(true);
    setError('');
    try{
      const response=await fetch('/api/learn',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'bookmark',course,lesson,saved:!saved})});
      const result=await response.json();
      if(!response.ok) throw Error(result.error);
      setSaved(result.saved);
    }catch(error){setError(error instanceof Error?error.message:'Could not update the bookmark.');}
    finally{setBusy(false);}
  }
  return <div>
    <button type="button" aria-pressed={saved} disabled={busy} onClick={toggle}>{saved?'Remove bookmark':'Bookmark lesson'}</button>
    {error&&<p role="alert">{error}</p>}
  </div>;
}
