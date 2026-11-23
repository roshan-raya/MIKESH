'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';

export default function LoginForm(){
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const configured=Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!configured) return;
    setBusy(true);
    setError('');
    const form=new FormData(event.currentTarget);
    try{
      const {error}=await supabaseBrowser().auth.signInWithPassword({
        email:String(form.get('email')).trim(),password:String(form.get('password')),
      });
      if(error) throw Error('Unable to sign in with those credentials.');
      window.location.assign('/dashboard');
    }catch(error){
      setError(error instanceof Error?error.message:'Sign-in is temporarily unavailable.');
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className="stack">
    <label>Email<input name="email" type="email" required autoComplete="username"/></label>
    <label>Password<input name="password" type="password" required autoComplete="current-password"/></label>
    {!configured&&<p className="muted">Sign-in requires the Supabase settings in .env.local.</p>}
    {error&&<p role="alert">{error}</p>}
    <button disabled={busy||!configured} className="primary">{busy?'Signing in…':'Sign in'}</button>
  </form>;
}
