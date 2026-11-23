import {cookies} from 'next/headers';
import {revalidatePath} from 'next/cache';
import {z} from 'zod';
import Nav from '@/components/nav';
import {requireStudent} from '@/lib/student';
import {adminDb} from '@/lib/supabase/admin';

async function savePreferences(form:FormData){
  'use server';
  const user=await requireStudent();
  const theme=z.enum(['system','light','dark']).parse(form.get('theme'));
  const daily_minutes=z.coerce.number().int().min(10).max(120).parse(form.get('minutes'));
  const {error}=await adminDb().from('profiles').upsert({user_id:user.id,daily_minutes});
  if(error) throw Error('Could not save preferences.');
  (await cookies()).set('act-theme',theme,{sameSite:'lax',httpOnly:true,path:'/',maxAge:31536000});
  revalidatePath('/','layout');
}
export default async function Settings(){
  const user=await requireStudent();
  const [{data,error},store]=await Promise.all([adminDb().from('profiles').select('daily_minutes').eq('user_id',user.id).maybeSingle(),cookies()]);
  if(error) throw Error('Could not load settings.');
  return <><Nav/><main id="main" className="shell"><h1>Settings</h1><section className="panel"><h2>Study preferences</h2>
    <form action={savePreferences} className="stack">
      <label>Daily study minutes<input name="minutes" type="number" min={10} max={120} defaultValue={data?.daily_minutes??30} required/></label>
      <label>Appearance<select name="theme" defaultValue={store.get('act-theme')?.value??'system'}><option value="system">System default</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
      <div><button className="primary">Save preferences</button></div>
    </form></section><section className="panel"><h2>Private account</h2><p>{user.email}</p></section>
  </main></>;
}
