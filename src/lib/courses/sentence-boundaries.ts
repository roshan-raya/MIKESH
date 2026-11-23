import type {Course} from './types';
import bank from '../../../content/sentence-boundaries-draft.json';
import {clauseFoundations, sentenceFragments, boundaryMeaning} from './sentence-boundary-lessons';

export const sentenceBoundaries:Course={
    slug:'sentence-boundaries',subject:'ENGLISH',domain:'Conventions of Standard English',topic:'Sentence boundaries',
    overview:'Find independent clauses and choose punctuation that expresses their relationship.',
    practiceTopics:['Sentence boundaries','Punctuation'],
    draftPracticeCount:bank.items.length,
    concepts:[
      {id:'clause-foundations',level:'beginner',prerequisites:[]},
      {id:'joining-clauses',level:'intermediate',prerequisites:['clause-foundations']},
      {id:'sentence-fragments',level:'standard',prerequisites:['clause-foundations','joining-clauses']},
      {id:'boundary-meaning',level:'advanced',prerequisites:['joining-clauses','sentence-fragments']},
    ],
    lessons:[clauseFoundations,{
      id:'joining-clauses',title:'Join complete ideas without a splice',minutes:18,
      objectives:['Find the subject and finite verb.','Tell a main clause from a dependent clause.','Choose a valid boundary between independent clauses.'],
      prerequisites:['Find the actor and action in a short sentence.','Recognize the conjunctions and, but, and so.'],
      instruction:[
        {title:'Test each side aloud',body:'An independent clause has a subject and a verb and expresses a complete thought. “The courier arrived” passes all three tests. “When the courier arrived” has a subject and verb, but when makes the reader wait for a main event. If one side is dependent, a semicolon or period there can leave a fragment.'},
        {title:'Use punctuation that fits the relationship',body:'A period separates two complete sentences. A semicolon connects closely related independent clauses. A comma plus a coordinating conjunction also joins independent clauses. A comma alone does not join them. A colon after a complete clause can introduce an explanation, example, or list.'},
        {title:'Separate grammar from meaning',body:'Several forms may be grammatical in isolation. Check what the relationship needs. A coordinating but signals contrast and so signals result. A semicolon before however keeps the clauses joined and a comma after however sets it off. A mere comma before however produces a splice.'},
      ],
      examples:[
        {title:'Repair a comma splice',prompt:'Revise “The lantern dimmed, we replaced its batteries.”',steps:['The lantern dimmed and we replaced its batteries could each stand alone.','The second action is a response to the first, so a result connector is useful.','Write “The lantern dimmed, so we replaced its batteries.” A semicolon would also be grammatical if an answer option used it.']},
        {title:'Keep the dependent opening',prompt:'Punctuate “Although the snow melted the bridge remained closed.”',steps:['Although makes the opening dependent.','The bridge remained closed is the independent clause.','Use a comma after the introductory dependent clause: “Although the snow melted, the bridge remained closed.”']},
        {title:'Join two ideas with a conjunctive adverb',prompt:'Revise “The workshop filled quickly, however Mara found a seat.”',steps:['The workshop filled quickly and Mara found a seat are complete clauses.','However signals contrast but cannot join the clauses with only a comma.','Use a semicolon before it and a comma after it: “The workshop filled quickly; however, Mara found a seat.”']},
      ],
      pitfalls:['Counting the verbs inside a modifier as additional main clauses.','Adding a comma between a subject and its verb.','Using a semicolon just because you hear a pause.'],
      timing:'On punctuation questions, read only the two clauses around the marked spot first. Eliminate impossible boundaries, then check the paragraph if the surviving choices differ in meaning.',
      guided:{prompt:'Which revision correctly links the independent clauses with “nevertheless”?',hint:'A comma by itself cannot separate the two full clauses.',choices:['The sign was clear, nevertheless, several riders missed the turn.','The sign was clear; nevertheless, several riders missed the turn.','The sign, was clear nevertheless several riders missed the turn.','The sign was clear; nevertheless several riders, missed the turn.'],answer:1,feedback:['The first comma still produces a comma splice.','The semicolon separates the clauses, and the comma follows the transitional word.','A comma cannot separate the subject “sign” from its verb.','The punctuation should follow “nevertheless,” not separate “riders” from “missed.”']},
      summary:'Find the main clauses first. A period, semicolon, or comma plus coordinator can separate two complete clauses. Check what the connector means.',
      sources:['act-english','purdue-clauses'],
    },sentenceFragments,boundaryMeaning],
};
