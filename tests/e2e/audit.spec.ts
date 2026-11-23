import {expect,test,type Page} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {courses} from '../../src/lib/courses';

const audit=Boolean(process.env.ACT_AUDIT_USER && process.env.ACT_AUDIT_OTHER);
const settings=()=>parseEnv(readFileSync('.env.local','utf8'));

async function signIn(page:Page,email=process.env.E2E_STUDENT_EMAIL!,password=process.env.E2E_STUDENT_PASSWORD!){
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button',{name:'Sign in'}).click();
}

async function submit(page:Page,name='Submit session'){
  await page.getByRole('button',{name,exact:true}).click();
  await page.getByRole('button',{name:'Confirm submission'}).click();
}

test('production audit of responsive routes, navigation and student controls',async({page})=>{
  test.skip(!audit,'Requires isolated Supabase audit accounts.');
  test.setTimeout(120_000);
  await signIn(page);
  await expect(page).toHaveURL(/\/dashboard$/);
  const routes=[
    ['/dashboard','Your study dashboard'],['/syllabus','Subject syllabus'],['/syllabus/functions','Read a quadratic’s minimum'],
    ['/syllabus/topic?subject=MATH&topic=Coordinate%20geometry','Coordinate geometry'],['/practice','Set up your practice'],
    ['/mock','Set up your practice'],['/diagnostic','Set up your practice'],['/mistakes','Mistake notebook'],
    ['/analytics','Performance analytics'],['/plan','Study plan'],['/review','Review schedule'],['/settings','Settings'],
    ['/sources','Source library'],['/advanced','Advanced preparation'],
    ...['functions','quadratics','proportional-reasoning','sentence-boundaries','inference','experimental-design','argument-perspectives'].map(slug=>['/learn/'+slug,'']),
  ];
  for(const [width,height] of [[1440,900],[834,1112],[390,844]]){
    await page.setViewportSize({width,height});
    for(const [route,heading] of routes){
      const response=await page.goto(route);
      expect(response?.status(),route).toBe(200);
      await expect(page.getByRole('heading',{level:1,name:heading||undefined,exact:Boolean(heading)})).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth),route).toBeLessThanOrEqual(width);
    }
  }
  await page.goto('/dashboard');
  await page.bringToFront();
  const skip=page.getByRole('link',{name:'Skip to content'});
  for(let tab=0;tab<12;tab++){
    await page.keyboard.press('Tab');
    if(await skip.evaluate(element=>document.activeElement===element)) break;
  }
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  await page.goto('/settings');
  await page.getByLabel('Daily study minutes').fill('45');
  await page.getByLabel('Appearance').selectOption('dark');
  await page.getByRole('button',{name:'Save preferences'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.goto('/plan');
  await expect(page.getByRole('heading',{name:'Today · 45 minutes'})).toBeVisible();
  const mark=page.getByRole('button',{name:/Complete Review due/});
  await mark.click();
  await expect(page.getByRole('button',{name:/Reopen Review due/})).toBeVisible();
  await page.getByRole('button',{name:/Reopen Review due/}).click();
  await expect(mark).toBeVisible();
  await page.goto('/analytics');
  await page.getByLabel('Form identifier').fill('Disposable audit form');
  await page.getByLabel('Date taken').fill('2026-11-23');
  for(const name of ['English','Math','Reading']) await page.getByRole('spinbutton',{name,exact:true}).fill('34');
  await page.getByRole('button',{name:'Record official practice score'}).click();
  await expect(page.getByText(/Disposable audit form · Composite 34/)).toBeVisible();
  await page.getByRole('button',{name:'Sign out'}).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/learn/functions');
  await expect(page).toHaveURL(/\/login$/);
});

test('production audit of ownership, server grading, saves, adaptive mode and assessments',async({page})=>{
  test.skip(!audit,'Requires isolated Supabase audit accounts.');
  test.setTimeout(120_000);
  const env=settings();
  const serverKey=process.env.SUPABASE_SECRET_KEY||env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY||env.SUPABASE_SERVICE_ROLE_KEY;
  if(!env.NEXT_PUBLIC_SUPABASE_URL||!serverKey||!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) throw Error('Audit secrets are missing.');
  const db=createClient(env.NEXT_PUBLIC_SUPABASE_URL,serverKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const publicDb=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const {error:anonymous}=await publicDb.from('questions').select('id').limit(1);
  expect(anonymous).toBeTruthy();
  const other=process.env.ACT_AUDIT_OTHER!;
  const own=process.env.ACT_AUDIT_USER!;
  const fixture=await db.rpc('start_study',{p_user:other,p_mode:'learn',p_subject:null,p_topic:null,p_count:1,p_science:false});
  expect(fixture.error).toBeNull();
  const otherAttempt=await db.rpc('update_study',{
    p_user:other,p_session:fixture.data,p_action:'check',p_position:1,p_answer:'A',p_flagged:false,p_confidence:null,p_seconds:10,p_essay:null,
  });
  expect(otherAttempt.error).toBeNull();
  const otherPage=await page.context().newPage();
  const otherToken=otherPage.waitForResponse(response=>response.url().includes('/auth/v1/token'));
  await signIn(otherPage,process.env.ACT_AUDIT_OTHER_EMAIL!,process.env.ACT_AUDIT_OTHER_PASSWORD!);
  expect((await otherToken).ok()).toBe(true);
  await otherPage.goto('/dashboard');
  await expect(otherPage).toHaveURL(/\/login$/);
  await otherPage.close();
  await signIn(page);
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('/study/'+fixture.data);
  await expect(page.getByRole('heading',{name:'This page could not be found.'})).toBeVisible();
  await expect(page.getByRole('region',{name:'Question player'})).toHaveCount(0);
  const denied=await page.request.post('/api/study',{data:{action:'submit',session:fixture.data}});
  expect(denied.status()).toBe(409);
  const auth=await publicDb.auth.signInWithPassword({email:process.env.E2E_STUDENT_EMAIL!,password:process.env.E2E_STUDENT_PASSWORD!});
  expect(auth.error).toBeNull();
  expect((await publicDb.from('questions').select('id').limit(1)).error).toBeTruthy();
  expect((await publicDb.from('session_questions').select('position').limit(1)).error).toBeTruthy();
  expect((await publicDb.from('attempts').select('id').eq('user_id',other)).data).toEqual([]);

  await page.goto('/practice?mode=topic&subject=MATH&topic=Functions');
  await page.getByLabel('Number of questions').fill('3');
  await page.getByRole('button',{name:'Start 3-question session'}).click();
  await expect(page.getByText(/1 of 3 · math · Functions/)).toBeVisible();
  const id=page.url().split('/').at(-1)!;
  const source=await db.from('session_questions').select('position,question_id,questions!session_questions_question_id_fkey(correct_answer)')
    .eq('session_id',id).order('position');
  expect(source.error).toBeNull();
  const first=source.data![0];
  const wrong=(question:{questions:unknown})=>{
    const related=question.questions as {correct_answer:string};
    return related.correct_answer==='A'?1:0;
  };
  let fail=true;
  await page.route('**/api/study',async route=>{
    const body=route.request().postDataJSON();
    if(fail&&body.action==='save'&&body.position===1&&body.answer) return route.abort();
    await route.continue();
  });
  await page.getByRole('radio').nth(wrong(first)).check();
  await expect(page.getByText(/Some changes are still unsaved/)).toBeVisible();
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await page.getByRole('radio').nth(wrong(source.data![1])).check();
  await page.getByLabel('Confidence').selectOption('guess');
  await page.getByLabel('Mark for review').check();
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await page.getByRole('radio').nth(wrong(source.data![2])).check();
  fail=false;
  await submit(page);
  await expect(page.getByRole('heading',{name:'0 correct out of 3'})).toBeVisible();
  const attempts=await db.from('attempts').select('id,is_correct,selected_answer').eq('session_id',id);
  expect(attempts.data?.length).toBe(3);
  expect(attempts.data?.every(row=>!row.is_correct)).toBe(true);
  await page.goto('/dashboard');
  await expect(page.getByText('Revisit Functions in math.')).toBeVisible();
  await page.goto('/mistakes?subject=MATH&topic=Functions');
  await page.getByLabel('Error category').first().selectOption('concept');
  await page.getByRole('button',{name:'Save category'}).first().click();
  await expect(page.getByLabel('Error category').first()).toHaveValue('concept');
  const due=await db.from('review_items').update({due_at:new Date(Date.now()-1000).toISOString()}).eq('user_id',own).eq('question_id',first.question_id);
  expect(due.error).toBeNull();
  await page.goto('/review');
  await page.getByRole('link',{name:'Start due review'}).click();
  await page.getByRole('button',{name:'Start 1-question session'}).click();
  await expect(page.getByText(/1 of 1 · math · Functions/)).toBeVisible();
  const correct=(first.questions as unknown as {correct_answer:string}).correct_answer;
  await page.getByRole('radio').nth('ABCD'.indexOf(correct)).check();
  await submit(page);
  await expect(page.getByRole('heading',{name:'1 correct out of 1'})).toBeVisible();
  const review=await db.from('review_items').select('due_at,interval_days').eq('user_id',own).eq('question_id',first.question_id).single();
  expect(review.data?.interval_days).toBe(2);
  expect(Date.parse(review.data!.due_at)).toBeGreaterThan(Date.now());

  await page.goto('/practice?mode=adaptive');
  await page.getByRole('button',{name:'Start 8-question session'}).click();
  await expect(page.getByText(/1 of 8 ·/)).toBeVisible();
  await page.goto('/practice?mode=timed&subject=MATH&topic=Functions');
  await page.getByLabel('Number of questions').fill('2');
  await page.getByRole('button',{name:'Start 2-question session'}).click();
  await expect(page.getByLabel('Time remaining')).toBeVisible();
  await expect(page.getByRole('button',{name:'Check answer'})).toHaveCount(0);
  const timed=page.url().split('/').at(-1)!;
  expect((await db.from('sessions').update({deadline:new Date(Date.now()-1000).toISOString()}).eq('id',timed).eq('user_id',own)).error).toBeNull();
  await page.reload();
  await expect(page.getByRole('alert').filter({hasText:'Time is up'})).toBeVisible();
  await expect(page.getByRole('radio').first()).toBeDisabled();
  const late=await page.request.post('/api/study',{data:{action:'save',session:timed,position:1,answer:'A'}});
  expect(late.status()).toBe(409);
  await submit(page);
  await expect(page.getByRole('heading',{name:'Session results'})).toBeVisible();

  await page.goto('/diagnostic');
  await page.getByRole('button',{name:'Start session'}).click();
  for(const subject of ['english','math','reading']){
    await expect(page.getByText(new RegExp('1 of 3 · '+subject))).toBeVisible();
    await expect(page.getByRole('button',{name:'Check answer'})).toHaveCount(0);
    await submit(page,'Submit section');
  }
  await expect(page.getByRole('heading',{name:'Session results'})).toBeVisible();
  await page.goto('/mock');
  await page.getByLabel('Include Science').check();
  await expect(page.getByRole('button',{name:'Start session'})).toBeDisabled();
  await page.goto('/practice?mode=writing');
  await page.getByRole('button',{name:'Start session'}).click();
  await page.getByLabel('Your essay').fill('An original QA essay about expanded library access.');
  await expect(page.getByText('Saved',{exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Your essay')).toHaveValue(/original QA essay/);
  await submit(page);
  await expect(page.getByRole('heading',{name:'Your essay'})).toBeVisible();
});

test('every detailed lesson loads, expands a worked solution and grades its guided exercise',async({page})=>{
  test.skip(!audit,'Requires an isolated Supabase audit account.');
  test.setTimeout(240_000);
  await signIn(page);
  await expect(page).toHaveURL(/\/dashboard$/);
  for(const course of courses){
    for(const lesson of course.lessons){
      await page.goto(`/learn/${course.slug}?lesson=${lesson.id}`);
      await expect(page.getByRole('heading',{name:lesson.title,exact:true})).toBeVisible();
      for(const example of lesson.examples){
        const group=page.locator('details.example').filter({has:page.locator('summary').getByText(example.title,{exact:true})});
        await group.locator('summary').first().click();
        for(const [index] of example.steps.entries()) await group.getByText('Step '+(index+1),{exact:true}).click();
        expect(await group.locator('details[open]').count()).toBe(example.steps.length);
      }
      await page.getByText('Show a hint',{exact:true}).click();
      await page.getByRole('radio').nth((lesson.guided.answer+1)%4).check();
      await page.getByRole('button',{name:'Check answer'}).click();
      await expect(page.getByRole('status').filter({hasText:'Try again'})).toBeVisible();
      await page.getByRole('radio').nth(lesson.guided.answer).check();
      await page.getByRole('button',{name:'Check answer'}).click();
      await expect(page.getByRole('status').filter({hasText:'Correct.'})).toBeVisible();
    }
    for(const tab of ['Practice','Review','Test']){
      await page.getByRole('navigation',{name:'Course activities'}).getByRole('link',{name:tab}).click();
      await expect(page.getByRole('navigation',{name:'Course activities'}).getByRole('link',{name:tab})).toHaveAttribute('aria-current','page');
    }
  }
});

test('a graded Functions question reveals specific feedback and a lesson-to-retest path',async({page})=>{
  test.skip(!audit,'Requires an isolated Supabase audit account.');
  test.setTimeout(90_000);
  const env=settings();
  const serverKey=process.env.SUPABASE_SECRET_KEY||env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY||env.SUPABASE_SERVICE_ROLE_KEY;
  if(!env.NEXT_PUBLIC_SUPABASE_URL||!serverKey) throw Error('Audit secrets are missing.');
  const db=createClient(env.NEXT_PUBLIC_SUPABASE_URL,serverKey,{auth:{persistSession:false,autoRefreshToken:false}});
  await signIn(page);
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('/practice?mode=topic&subject=MATH&topic=Functions');
  await page.getByLabel('Number of questions').fill('1');
  await page.getByRole('button',{name:'Start 1-question session'}).click();
  await expect(page.getByText(/1 of 1 · math · Functions/)).toBeVisible();
  const learn=page.getByRole('button',{name:'Learn Everything Behind This Question'});
  await expect(learn).toHaveCount(0);
  const session=page.url().split('/').at(-1)!;
  const result=await db.from('session_questions').select('questions!session_questions_question_id_fkey(correct_answer)')
    .eq('session_id',session).single();
  expect(result.error).toBeNull();
  const q=result.data!.questions as unknown as {correct_answer:string};
  await page.getByRole('radio').nth(q.correct_answer==='A'?1:0).check();
  await page.getByRole('button',{name:'Check answer'}).click();
  await expect(learn).toBeVisible();
  const feedback=page.locator('details').filter({has:page.getByText('Why the other choices don’t work',{exact:true})});
  await expect(feedback.getByRole('listitem')).toHaveCount(3);
  await learn.click();
  const map=page.getByRole('region',{name:'Question learning path'});
  await expect(map.getByRole('heading',{name:'Concept map'})).toBeVisible();
  await expect(map.getByText('Learning objective')).toBeVisible();
  await expect(map.getByText('Skill to check first')).toBeVisible();
  const retest=await map.getByRole('link',{name:'Retest with unseen questions'}).getAttribute('href');
  await map.getByRole('link',{name:'Open recommended lesson'}).click();
  await expect(page.getByRole('heading',{name:'Guided practice'})).toBeVisible();
  await page.goto(retest!);
  await expect(page.getByRole('heading',{name:'Mastery evidence'})).toBeVisible();
  if(process.env.E2E_COURSE_MIGRATION==='1') {
    await page.getByRole('button',{name:'Start unseen mastery check'}).click();
    await expect(page.getByLabel('Time remaining')).toBeVisible();
  } else {
    await expect(page.getByText('Unseen mastery checks require database migration 004.')).toBeVisible();
  }
});

test('the Quadratics textbook branches from a miss to a checkpoint, bookmark, and focused retest',async({page})=>{
  test.skip(!audit,'Requires an isolated Supabase audit account.');
  test.setTimeout(120_000);
  const env=settings();
  const key=process.env.SUPABASE_SECRET_KEY||env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY||env.SUPABASE_SERVICE_ROLE_KEY;
  if(!env.NEXT_PUBLIC_SUPABASE_URL||!key) throw Error('Audit secrets are missing.');
  const db=createClient(env.NEXT_PUBLIC_SUPABASE_URL,key,{auth:{persistSession:false,autoRefreshToken:false}});
  await signIn(page);
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('/textbook');
  await page.getByRole('link',{name:'Continue Quadratic Equations'}).click();
  await expect(page.getByRole('heading',{name:'Quadratic Equations',exact:true})).toBeVisible();
  const levels=page.getByRole('navigation',{name:'Chapter levels'});
  await expect(levels.getByRole('link')).toHaveCount(4);
  await levels.getByRole('link',{name:'Advanced 34–36'}).click();
  await expect(page).toHaveURL(/[?&]level=advanced(?:&|$)/,{timeout:15_000});
  await expect(page.getByRole('heading',{name:'Analyze and optimize quadratic models'})).toBeVisible();
  await expect(page.getByRole('img',{name:/Seven plotted points/})).toBeVisible();
  await page.getByRole('link',{name:'Teach Me From the Basics'}).click();
  await expect(page).toHaveURL(/[?&]lesson=variables(?:&|$)/);
  await expect(page.getByRole('heading',{name:'Variables, expressions, and equations'})).toBeVisible();

  const question=await db.from('questions').select('id,correct_answer').eq('bank_key','px-q02@1').single();
  expect(question.error).toBeNull();
  const start=await db.rpc('start_study',{p_user:process.env.ACT_AUDIT_USER,p_mode:'topic',
    p_subject:'MATH',p_topic:'Quadratics',p_count:50,p_science:false});
  expect(start.error).toBeNull();
  const selection=await db.from('session_questions').select('position').eq('session_id',start.data).eq('question_id',question.data!.id).maybeSingle();
  const position=selection.data?.position;
  if(!position) throw Error('Expected the audit session to include the original zero-product item.');
  await page.goto('/study/'+start.data);
  await page.getByRole('button',{name:'Question '+position,exact:true}).click();
  await expect(page.getByRole('button',{name:'Learn Everything Behind This Question'})).toHaveCount(0);
  await page.getByRole('radio').first().check();
  await page.getByRole('button',{name:'Check answer'}).click();
  await page.getByRole('button',{name:'Learn Everything Behind This Question'}).click();
  const map=page.getByRole('region',{name:'Question learning path'});
  await expect(map.getByRole('link',{name:'Signed multiplication and the distributive property'})).toBeVisible();
  await expect(map.getByRole('link',{name:'Polynomial terms, degree, and standard form'})).toBeVisible();
  await expect(map.getByRole('link',{name:'Functions',exact:true})).toHaveAttribute('href','/learn/functions');
  const retest=await map.getByRole('link',{name:'Retest with unseen questions'}).getAttribute('href');
  await map.getByRole('link',{name:'Open recommended lesson'}).click();
  await expect(page.getByRole('heading',{name:'The zero-product property',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Bookmark lesson'}).click();
  await expect(page.getByRole('button',{name:'Remove bookmark'})).toBeVisible();
  await page.getByText('Show a hint',{exact:true}).click();
  await page.getByRole('radio').nth(2).check();
  await page.getByRole('button',{name:'Check answer'}).click();
  await expect(page.getByText('Either factor may be zero.',{exact:false})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button',{name:'Remove bookmark'})).toBeVisible();
  await page.goto('/textbook');
  await expect(page.getByRole('link',{name:'The zero-product property',exact:true})).toBeVisible();
  await page.goto(retest!);
  await expect(page.getByText('Retest focus · The zero-product property')).toBeVisible();
  if(process.env.E2E_CHAPTER_MIGRATION==='1'){
    await page.getByRole('button',{name:'Start unseen mastery check'}).click();
    await expect(page.getByLabel('Time remaining')).toBeVisible();
  }else await expect(page.getByText('Focused unseen retests require database migrations 004 and 007.')).toBeVisible();
});


test('Proportional Reasoning saves progress and explains unavailable draft practice',async({page})=>{
  test.skip(!audit,'Requires an isolated Supabase audit account.');
  await signIn(page);
  await expect(page).toHaveURL(/\/dashboard$/);
  const chapter='/learn/proportional-reasoning';
  await page.goto(chapter+'?level=advanced');
  await expect(page.getByRole('heading',{name:'Combine rates and test proportional models'})).toBeVisible();
  const graph=page.getByRole('heading',{name:'Concept dependency graph'}).locator('..');
  await graph.getByRole('link',{name:'Find the part, percent, or base',exact:true}).first().click();
  await expect(page.getByRole('heading',{name:'Find the part, percent, or base'})).toBeVisible();
  await page.getByRole('button',{name:'Bookmark lesson'}).click();
  await expect(page.getByRole('button',{name:'Remove bookmark'})).toBeVisible();
  await page.getByText('Show a hint',{exact:true}).click();
  await page.getByRole('radio').nth(0).check();
  await page.getByRole('button',{name:'Check answer'}).click();
  await expect(page.getByRole('status').filter({hasText:'Try again'})).toBeVisible();
  await page.getByRole('radio').nth(2).check();
  await page.getByRole('button',{name:'Check answer'}).click();
  await expect(page.getByRole('status').filter({hasText:'Correct.'})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button',{name:'Remove bookmark'})).toBeVisible();
  await page.goto('/textbook');
  await expect(page.getByRole('link',{name:'Find the part, percent, or base',exact:true})).toBeVisible();
  await page.goto(chapter+'?view=practice&lesson=percent-base&focus=percent-base');
  await expect(page.getByText('Practice focus · Find the part, percent, or base')).toBeVisible();
  if(process.env.E2E_PROPORTIONS_RELEASED!=='1'){
    await expect(page.getByText('40 original practice questions are awaiting editorial review.',{exact:false})).toBeVisible();
    await expect(page.getByText('0 available questions across this course’s linked topics.')).toBeVisible();
  }
  await page.goto(chapter+'?view=test&lesson=percent-base&focus=percent-base');
  await expect(page.getByText('Retest focus · Find the part, percent, or base')).toBeVisible();
  if(process.env.E2E_CHAPTER_MIGRATION!=='1')
    await expect(page.getByText('Focused unseen retests require database migrations 004 and 007.')).toBeVisible();
});

test('a Linear Equations miss links to the lesson without changing the original item',async({page})=>{
  test.skip(!audit,'Requires an isolated Supabase audit account.');
  await signIn(page);
  await expect(page).toHaveURL(/\/dashboard$/);
  const env=settings();
  const key=env.SUPABASE_SECRET_KEY||env.SUPABASE_SERVICE_ROLE_KEY;
  if(!env.NEXT_PUBLIC_SUPABASE_URL||!key) throw Error('Audit secrets are missing.');
  const db=createClient(env.NEXT_PUBLIC_SUPABASE_URL,key);
  const session=await db.rpc('start_study',{p_user:process.env.ACT_AUDIT_USER,p_mode:'topic',
    p_subject:'MATH',p_topic:'Linear equations',p_count:2,p_science:false});
  expect(session.error).toBeNull();
  await page.goto('/study/'+session.data);
  await page.getByRole('radio').first().check();
  await page.getByRole('button',{name:'Check answer'}).click();
  await page.getByRole('button',{name:'Learn Everything Behind This Question'}).click();
  await page.getByRole('link',{name:'Open recommended lesson'}).click();
  await expect(page).toHaveURL(/\/learn\/linear-equations\?lesson=(balance|constraints)$/);
  await expect(page.getByRole('heading',{name:'Guided practice'})).toBeVisible();
});
