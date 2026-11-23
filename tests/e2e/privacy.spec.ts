import {expect,test} from '@playwright/test';

test('private pages redirect unauthenticated visitors',async({page})=>{
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading',{name:'ACT Mastery'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Sign in'})).toBeVisible();
});
test('private study and tutor endpoints reject unauthenticated writes',async({request})=>{
  for(const endpoint of ['/api/study','/api/tutor']){
    const response=await request.post(endpoint,{data:{action:'start',mode:'learn'}});
    expect([401,503]).toContain(response.status());
  }
});
test('approved student answers a practice question and resumes it after reload',async({page})=>{
  test.skip(!process.env.E2E_STUDENT_EMAIL||!process.env.E2E_STUDENT_PASSWORD,'Requires a disposable seeded Supabase student.');
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button',{name:'Sign in'}).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('/practice');
  await page.getByLabel('Number of questions').fill('1');
  await page.getByRole('button',{name:'Start 1-question session'}).click();
  await expect(page).toHaveURL(/\/study\//);
  await page.getByRole('radio').first().check();
  await expect(page.getByText('Saved',{exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('radio').first()).toBeChecked();
  await page.getByRole('button',{name:'Check answer'}).click();
  await expect(page.getByRole('button',{name:'Check answer'})).toHaveCount(0);
  await page.getByRole('button',{name:'Submit session'}).click();
  await page.getByRole('button',{name:'Confirm submission'}).click();
  await expect(page.getByRole('heading',{name:'Session results'})).toBeVisible();
});

test('Functions lessons save guided progress and start correctly sized practice',async({page})=>{
  test.skip(!process.env.E2E_STUDENT_EMAIL||!process.env.E2E_STUDENT_PASSWORD,'Requires a disposable seeded Supabase student.');
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button',{name:'Sign in'}).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('/syllabus');
  await expect(page.getByRole('heading',{name:'Subject syllabus'})).toBeVisible();
  await page.getByRole('link',{name:'Functions',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Function notation and representations'})).toBeVisible();
  await page.getByText('Show a hint',{exact:true}).click();
  await expect(page.getByText('Decide which inequality includes', {exact:false})).toBeVisible();
  await page.getByRole('radio').nth(0).check();
  await page.getByRole('button',{name:'Check answer'}).click();
  await expect(page.getByRole('status').filter({hasText:'Try again'})).toBeVisible();
  await page.getByRole('radio').nth(1).check();
  await page.getByRole('button',{name:'Check answer'}).click();
  await expect(page.getByText('1 of 4 guided exercises completed',{exact:false})).toBeVisible();
  await page.getByText('Scratchpad',{exact:true}).click();
  await page.getByRole('textbox',{name:'Working notes'}).fill('Test the equality boundary first.');
  await page.reload();
  await expect(page.getByRole('heading',{name:'Domain, range, and restrictions'})).toBeVisible();
  await page.getByText('Scratchpad',{exact:true}).click();
  await expect(page.getByRole('textbox',{name:'Working notes'})).toHaveValue('Test the equality boundary first.');
  await page.goto('/syllabus/topic?subject=MATH&topic=Domain%20and%20range');
  await expect(page.getByRole('heading',{name:'Domain and range',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Related course: Functions'})).toBeVisible();
  if(process.env.E2E_COURSE_MIGRATION==='1'){
    await page.goto('/learn/functions?view=test');
    await page.getByLabel('Difficulty').selectOption('advanced');
    await page.getByLabel('Questions',{exact:true}).fill('3');
    await page.getByRole('button',{name:'Start unseen mastery check'}).click();
    await expect(page.getByText(/1 of 3 · math · Functions/)).toBeVisible();
    await expect(page.getByRole('button',{name:'Check answer'})).toHaveCount(0);
    await page.getByRole('radio').first().check();
    await expect(page.getByText('Saved',{exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Submit session'}).click();
    await page.getByRole('button',{name:'Confirm submission'}).click();
    await expect(page.getByRole('heading',{name:'Session results'})).toBeVisible();
  }
  await page.goto('/practice?mode=topic&subject=MATH&topic=Functions');
  await expect(page.getByText(/(?:10|22) available questions for this selection/)).toBeVisible();
  await page.getByRole('button',{name:'Start 8-question session'}).click();
  await expect(page.getByText(/1 of 8 · math · Functions/)).toBeVisible();
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await expect(page.getByText(/2 of 8 · math · Functions/)).toBeVisible();
  await page.goto('/learn/functions?view=test');
  await expect(page.getByText('Mastery evidence still developing')).toBeVisible();
  await page.goto('/mistakes?subject=MATH&topic=Functions');
  await expect(page.getByRole('heading',{name:'Mistake notebook'})).toBeVisible();
  await page.goto('/analytics');
  await expect(page.getByRole('heading',{name:'Performance analytics'})).toBeVisible();
});
