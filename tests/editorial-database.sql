\set ON_ERROR_STOP on
begin;

do $$
declare
  review uuid;
begin
  if has_function_privilege('authenticated','public.record_question_editorial_review(text,text,text,text[],text,boolean,boolean,boolean,boolean)','execute')
     or has_function_privilege('service_role','public.record_question_editorial_review(text,text,text,text[],text,boolean,boolean,boolean,boolean)','execute')
     or has_table_privilege('service_role','public.question_editorial_reviews','insert') then
    raise exception 'A runtime role can manufacture editorial approvals';
  end if;

  begin
    perform record_question_editorial_review(
      'px-fn01@1','Disposable SQL test','approved',array['https://example.test/math'],
      'Synthetic test for an incomplete review checklist',true,true,true,false);
    raise exception 'Incomplete editorial approval was accepted' using errcode='22000';
  exception when raise_exception then null;
  end;

  select record_question_editorial_review(
    'px-fn01@1','Disposable SQL test','changes_requested',array['https://example.test/math'],
    'Synthetic test entry, rolled back with this transaction',true,false,true,false)
  into review;
  if not exists(select 1 from question_editorial_reviews
    where id=review and version=1 and decision='changes_requested' and revision_snapshot ? 'correct_answer') then
    raise exception 'Review did not preserve the revision snapshot';
  end if;

  begin
    insert into questions(subject,topic,prompt,options,correct_answer,explanation,status,bank_key,holdout)
    values('MATH','Functions','Disposable mock fixture','[]','A','Test only','verified','mock-test-fixture@1',true);
    raise exception 'Unreleased mock questions could be published' using errcode='22000';
  exception when check_violation then null;
  end;
end
$$;
rollback;
