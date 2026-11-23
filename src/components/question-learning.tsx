'use client';

import { useId,useState } from 'react';
import { RichText } from './rich-text';
import type { QuestionLearning } from '@/lib/courses/question-learning';

export default function QuestionLearningPanel({learning}: {learning:QuestionLearning}) {
  const id=useId();
  const [open,setOpen]=useState(false);
  return <div className="stack">
    <div><button type="button" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}>
      Learn Everything Behind This Question
    </button>{learning.complete&&<span> · <a href={learning.error?.link??learning.link}>Explain This Question</a></span>}</div>
    <section id={id} hidden={!open} aria-label="Question learning path">
      <div className="stack">
        {learning.complete?<>
          <h3>Concept map</h3>
          {learning.difficulty&&<p className="muted">Question difficulty {learning.difficulty} of 5</p>}
          <ol className="course-steps">
            <li><strong>Topic</strong> · {learning.topic}</li>
            <li><strong>Subtopic</strong> · <a href={learning.link}>{learning.subtopic}</a></li>
            <li><strong>Primary skill</strong> · {learning.skill}</li>
            <li><strong>Supporting skills</strong> · {learning.secondary.join(', ')}</li>
          </ol>
          <p><strong>Learning objective</strong> · <RichText value={learning.objective!}/></p>
          <h3>Prerequisites</h3>
          <ul className="course-bullets">{learning.prerequisites.map(text=><li key={text}><RichText value={text}/></li>)}</ul>
          {learning.foundationLinks.length>0&&<ol className="course-steps">
            {learning.foundationLinks.map(step=><li key={step.link}><a href={step.link}>{step.title}</a></li>)}
          </ol>}
          {learning.related.length>0&&<><h3>Related concepts</h3><ul className="rows">
            {learning.related.map(step=><li key={step.link}><a href={step.link}>{step.title}</a></li>)}
          </ul></>}
          {learning.relatedTopics.length>0&&<><h3>Related chapters</h3><ul className="rows">
            {learning.relatedTopics.map(topic=><li key={topic.link}><a href={topic.link}>{topic.title}</a></li>)}
          </ul></>}
          {learning.error&&<p><strong>Skill to check first</strong> · <a href={learning.error.link}>{learning.error.gap}</a></p>}
          <div className="toolbar"><a className="primary" href={learning.error?.link??learning.link}>Open recommended lesson</a>
            <a href={learning.chapter!}>Learn This Topic</a><a href={learning.retest!}>Retest with unseen questions</a><a href={learning.basics!}>Teach Me From the Basics</a></div>
        </>:<><p>Question-specific skills and prerequisite links are still under review.</p>
          <a href={learning.link}>Explore {learning.topic}</a></>}
      </div>
    </section>
  </div>;
}
