import type {Lesson} from './types';

export const clauseFoundations:Lesson={
  id:'clause-foundations',title:'Find the clause and its main verb',minutes:19,
  objectives:['Find the grammatical subject even when a modifier interrupts it.','Distinguish finite verbs from participles and infinitives.','Decide whether a complete clause can stand alone.'],
  prerequisites:['Identify a noun and an action or state in a short sentence.'],
  instruction:[
    {title:'Locate the verb that carries the statement',body:'Start with the verb or verb group that can express tense or include a modal. In “The gardener was measuring the bed,” was measuring is the main verb group. In “The gardener measuring the bed,” measuring describes the gardener. The group tells us which gardener, while the sentence still needs a main statement.'},
    {title:'Pair the verb with its subject',body:'The subject tells us who or what the finite verb is about. In “The folders near the window need labels,” folders is the subject. Near the window modifies folders, so window does not control the verb. An imperative such as “Close the gate” can have an understood subject, you.'},
    {title:'Test independence after identifying a clause',body:'A subject and finite verb can appear inside a dependent clause. In “Although the path dried,” although signals a concession and leaves the reader waiting for the main statement. In “The path dried and reopened,” two verbs share one subject. There is one independent clause and a compound predicate.'},
  ],
  examples:[
    {title:'Remove an interrupting phrase',prompt:'Find the subject and main verb in “The labels beneath the drawers were peeling.”',steps:['Set aside “beneath the drawers” because it tells where the labels are.','The main verb group is “were peeling.”','The labels are what were peeling, so labels is the subject.']},
    {title:'Separate a participle from a finite verb',prompt:'Is “The mechanic checking the gauge” a complete sentence?',steps:['“Checking the gauge” describes the mechanic.','Checking by itself gives no finite main verb for the subject.','Add a main action: “The mechanic checking the gauge recorded its reading.”']},
    {title:'Compare three structures',prompt:'Classify “The path dried,” “after the path dried,” and “after the storm.”',steps:['The first can stand alone.','The second has a subject and finite verb, but after makes it dependent.','The third is a phrase. Storm is the object of after and there is no verb.'],table:{caption:'A subject and tense help distinguish clauses from phrases',headings:['Group','Finite verb','Role'],rows:[['The path dried','dried','Independent clause'],['after the path dried','dried','Dependent clause'],['after the storm','None','Phrase']]}},
  ],
  pitfalls:['Treating every word ending in -ing as a finite verb.','Using the nearest noun as the subject.','Counting two verbs with one subject as two independent clauses.'],
  timing:'Bracket modifiers and circle the finite verb on each side before considering punctuation.',
  guided:{prompt:'Which group is an independent clause?',hint:'Look for a finite main verb without a word that makes the clause depend on another.',choices:['Before the panel opened','The panel opened slowly','The panel opening slowly','Near the opening panel'],answer:1,feedback:['Before makes this a dependent clause.','The subject is panel, the main verb is opened, and the thought stands alone.','Opening modifies panel. The group has no finite main verb.','This is a prepositional phrase.']},
  summary:'Find the subject and finite verb, then check that the clause can stand alone.',
  sources:['act-english','purdue-clauses','purdue-fragments'],
};

export const sentenceFragments:Lesson={
  id:'sentence-fragments', title:'Repair fragments and mixed constructions',minutes:23,dependsOn:'joining-clauses',
  objectives:['Recognize missing or disconnected main clauses.','Choose a repair that preserves chronology and cause.','Use the sentence before and after an edit to check attachment.'],
  prerequisites:['Identify dependent clauses and nonfinite phrases.','Recognize valid boundaries between independent clauses.'],
  instruction:[
    {title:'A period does not create a main clause',body:'A sentence boundary should leave a complete statement on each side. “The lights failed. Because the breaker tripped.” isolates a reason clause. Reattach it to the statement it explains or remove the subordinator if the reason is being presented as a separate statement. When both repairs are grammatical, compare emphasis and meaning.'},
    {title:'Find what a phrase modifies',body:'An opening participial phrase attaches to the subject of the following clause. In “Checking the batteries, the technician noticed a bent contact,” the technician did the checking. If the subject were “a bent contact,” the grammar would assign the action to the contact. Repair a dangling opening by adding the actual actor or making the opening a clause.'},
    {title:'Keep the construction consistent',body:'A prepositional phrase cannot ordinarily act as the subject of its own finite verb. “By replacing the gasket stopped the leak” mixes a method phrase with a predicate. Remove by so the gerund phrase becomes the subject, or name the agent before the predicate and move the method phrase.'},
  ],
  examples:[
    {title:'Reconnect a reason clause',prompt:'Repair “The crew delayed the launch. Because a seal leaked.”',steps:['Because marks a reason and makes the second group dependent.','The reason explains the crew’s delay.','Write “The crew delayed the launch because a seal leaked.”']},
    {title:'Restore the actor',prompt:'Repair “Testing the cables, a loose plug became apparent.” The crew conducted the test.',steps:['The first phrase needs an actor.','A loose plug cannot test cables.','Write “Testing the cables, the crew found a loose plug.”']},
    {title:'Repair a mixed opening',prompt:'Repair “By replacing the hinge stopped the squeak.”',steps:['The word by starts a phrase of method, leaving stopped with no subject.','Remove by to make the action the grammatical subject.','“Replacing the hinge stopped the squeak” preserves the causal claim.']},
  ],
  pitfalls:['Treating a long phrase as a sentence merely because it contains a verb form.','Attaching an opening modifier to the closest noun instead of the main subject.','Repairing punctuation while leaving the cause or sequence unclear.'],
  timing:'Read one sentence on either side of the marked boundary. Identify what the dependent material explains before attaching it.',
  guided:{prompt:'Which revision explains why the rehearsal moved indoors?',hint:'Make sure the clause starting with because belongs to the statement about the move.',choices:['The rehearsal moved indoors. Because the wind rose.','Because the wind rose; the rehearsal moved indoors.','The rehearsal moved indoors because the wind rose.','The rehearsal moved indoors, the wind rose.'],answer:2,feedback:['The second group is a fragment.','A semicolon would separate a dependent clause from its main clause.','The reason clause attaches directly to the complete statement.','The comma splices two independent clauses and does not state the reason.']},
  summary:'Repair the sentence boundary and then confirm that each phrase attaches to the intended actor, cause, or event.',
  sources:['act-english','purdue-clauses','purdue-fragments'],
};

export const boundaryMeaning:Lesson={
  id:'boundary-meaning',title:'Preserve meaning and emphasis across boundaries',minutes:27,dependsOn:'sentence-fragments',
  objectives:['Choose among grammatically valid revisions using the stated relationship.','Distinguish essential modifiers from supplementary information.','Separate a general claim from a specific explanation or illustration.'],
  prerequisites:['Find boundaries and repair fragments.','Trace which noun an added phrase modifies.'],
  instruction:[
    {title:'Decide what the edit must say',body:'Get the grammar right, then compare the meanings of the surviving choices. “The cabinet was locked, so the archivist called security” states a result. “The cabinet was locked, but the archivist called security” frames the call as an unexpected contrast. A semicolon leaves the exact relationship for the reader to infer.'},
    {title:'Use a colon only after a complete introduction',body:'A colon can introduce material that specifies the first part. “The team needed one tool: a torque wrench” works because the introduction could stand alone. “The team needed: a torque wrench” separates the verb needed from its required object. For a two-clause colon, ask whether the second clause explains the first.'},
    {title:'Test the effect of removing a modifier',body:'In “The crates that contained glass stayed inside,” the modifier identifies which crates stayed. With paired commas, “The crates, which contained glass, stayed inside” treats the glass as background about the identified crates. The question may specify that every crate contained glass, or only a subset did. Use that fact before choosing punctuation.'},
  ],
  examples:[
    {title:'Prefer a result connector',prompt:'The sensor failed and the team reset the controller in response. Join the ideas while stating that relationship.',steps:['Both ideas are independent clauses.','The reset is a response, so choose so.','Write “The sensor failed, so the team reset the controller.”']},
    {title:'Introduce the specific explanation',prompt:'Revise “The rehearsal hit one snag the only key was missing.”',steps:['“The rehearsal hit one snag” is complete.','The second clause identifies the snag.','Use an explanatory colon: “The rehearsal hit one snag: the only key was missing.”']},
    {title:'Preserve a subset',prompt:'Only trays marked G belong in the greenhouse. Choose a version that identifies that subset.',steps:['Without “marked G,” the statement would refer to all trays in context.','The modifier identifies which trays are intended.','Write “The trays marked G belong in the greenhouse.”']},
  ],
  pitfalls:['Assuming every grammatical choice has the same meaning.','Inserting a colon immediately after a verb that still needs its object.','Adding paired commas to a phrase that selects a subset.'],
  timing:'Eliminate fragments and splices first. Use the question’s stated purpose or the surrounding passage to choose among the survivors.',
  guided:{prompt:'Only the volunteers trained in first aid were assigned to the medical tent. Which revision preserves the restriction?',hint:'Check whether removing the modifier broadens the group.',choices:['The volunteers, trained in first aid, were assigned to the medical tent.','The volunteers trained in first aid were assigned to the medical tent.','The volunteers trained in first aid, were assigned to the medical tent.','The volunteers, trained in first aid were assigned to the medical tent.'],answer:1,feedback:['Paired commas make the training background about all the volunteers in context.','The unpunctuated modifier identifies the volunteers assigned to the medical tent.','The comma splits the complete subject from its verb.','The comma opens a supplementary modifier without closing it.']},
  summary:'Check completeness first, then compare the logical relationship, emphasis, and scope of the surviving edits.',
  sources:['act-english','purdue-clauses','purdue-punctuation'],
};
