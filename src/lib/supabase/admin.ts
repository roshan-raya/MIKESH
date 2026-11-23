import 'server-only';
import {createClient} from '@supabase/supabase-js';

export function adminDb() {
  const key=process.env.SUPABASE_SECRET_KEY?.trim()||process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if(!key) throw Error('The Supabase server credential is missing.');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,key,{
    auth:{persistSession:false,autoRefreshToken:false},
    global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})},
  });
}
