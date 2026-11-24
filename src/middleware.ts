import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request:NextRequest){
  const path=request.nextUrl.pathname;
  const isApi=path.startsWith('/api/');
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if(path==='/login') return NextResponse.next();
    if(isApi) return NextResponse.json({error:'Authentication is unconfigured.'},{status:503});
    return NextResponse.redirect(new URL('/login',request.url));
  }
  let response=NextResponse.next({request});
  const client=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{
    cookies:{
      getAll(){return request.cookies.getAll();},
      setAll(items: {name:string;value:string;options:CookieOptions}[]){
        items.forEach(({name,value})=>request.cookies.set(name,value));
        response=NextResponse.next({request});
        items.forEach(({name,value,options})=>response.cookies.set(name,value,options));
      }
    }
  });
  const {data:{user}}=await client.auth.getUser();
  const approved=process.env.ALLOWED_STUDENT_EMAIL?.trim().toLowerCase();
  const allowed=Boolean(approved && user?.email_confirmed_at && !user.is_anonymous && user.email?.toLowerCase()===approved);
  if(user && !allowed) await client.auth.signOut({scope:'local'});
  if ((!allowed && path!=='/login') || (allowed && path==='/login')) {
    const result=isApi ? NextResponse.json({error:'Sign in with the approved account.'},{status:401})
      : NextResponse.redirect(new URL(allowed?'/dashboard':'/login',request.url));
    response.cookies.getAll().forEach(cookie=>result.cookies.set(cookie));
    return result;
  }
  return response;
}

export const config={
  runtime:'nodejs',
  matcher:['/((?!_next/static|_next/image|favicon.ico).*)']
};
