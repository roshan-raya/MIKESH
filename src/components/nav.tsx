import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

async function signOut() {
  'use server';
  const db=await supabaseServer();
  await db.auth.signOut();
  redirect('/login');
}
const links=[['Dashboard','dashboard'],['Textbook','textbook'],['Syllabus','syllabus'],['Practice','practice'],['Mock','mock'],['Mistakes','mistakes'],['Analytics','analytics'],['Plan','plan'],['Review','review'],['Settings','settings']];
export default function Nav(){return <header className="site-header">
  <a className="skip" href="#main">Skip to content</a>
  <nav aria-label="Main navigation">
    <Link className="brand" href="/dashboard"><span aria-hidden="true">A</span> ACT Mastery</Link>
    <div className="nav-links">{links.map(([label,path])=><Link key={path} href={'/'+path}>{label}</Link>)}</div>
    <form action={signOut}><button>Sign out</button></form>
  </nav>
</header>}
