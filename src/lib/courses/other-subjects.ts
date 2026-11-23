import type { Course } from './types';
import {sentenceBoundaries} from './sentence-boundaries';

export const otherCourses: Course[] = [
  sentenceBoundaries,{
    slug:'inference',subject:'READING',domain:'Key Ideas and Details',topic:'Inference',
    overview:'Use specific words and events to draw a conclusion that stays within the evidence.',
    practiceTopics:['Inference','Evidence'],
    lessons:[{
      id:'evidence-first',title:'Draw the smallest supported inference',minutes:17,
      objectives:['Distinguish information on the page from a reasonable inference.','Match an inference to precise text evidence.','Reject persuasive but unsupported alternatives.'],
      prerequisites:['Retell a sentence without adding your own explanation.','Identify who is speaking or acting.'],
      instruction:[
        {title:'Build a two-part answer',body:'First find what the passage literally states. Then say the smallest idea those details imply when combined. The inference should account for the evidence with minimal assumptions. A believable story about the character is weaker than a direct explanation of a particular change in behavior.'},
        {title:'Check the strength of the claim',body:'Words such as always, only, completely, and never make a choice harder to support. Test whether the passage rules out exceptions. Also avoid adding motivations or causal relationships that the passage leaves open. The most defensible inference might describe uncertainty or a revised plan instead of claiming to know a person’s feelings.'},
        {title:'Distinguish conflicting voices',body:'With paired passages, mark who argues what before comparing. Evidence from Passage A cannot prove that a writer in Passage B personally holds that view. Find the sentence that supports each writer’s position and then compare causes, goals, or qualifications.'},
      ],
      examples:[
        {title:'Literary inference',prompt:'“At the audition, Daria set her sheet music on the stand. When the accompanist began, she folded the sheet and sang a verse she had practiced at home.” What can you infer?',steps:['Daria brought sheet music but changed what she did once the music began.','The action supports that she adjusted her plan.','It does not establish whether she was nervous, bored, or asked to change. Those claims require information the text lacks.']},
        {title:'Infer a constraint from a choice',prompt:'“The archive turned off its scanner every afternoon and asked researchers to use digital copies. A repair crew inspected the wiring outside those hours.” What does the evidence suggest?',steps:['Scanning was limited while repairs were underway.','Researchers could still use the existing digital copies, so their access was restricted rather than eliminated.','The details do not establish that afternoon scans damaged documents or that the archive planned to stop scanning permanently.']},
        {title:'Qualify a natural-science conclusion',prompt:'“Shaded plots retained more water on the two hottest days. On cooler days, both groups lost roughly the same amount.” What conclusion follows?',steps:['Identify the comparison: shade versus exposure on hot and cool days.','The effect is stronger under the hot conditions described.','The result supports a condition-dependent association, not the claim that shade always prevents water loss.']},
      ],
      pitfalls:['Choosing a detail that is true but does not answer the question.','Inferring a motive from a single ambiguous action.','Treating an observed association as proof of cause.'],
      timing:'Before looking at the options, put a short inference in your own words. Give each surviving choice one evidence check. If you cannot point to a phrase, mark it and move on.',
      guided:{prompt:'“After the first bus went by without stopping, Eli moved from the shelter to the curb. He raised his hand as the next bus approached.” Which inference has the strongest support?',hint:'What problem did Eli respond to, and what did he change?',choices:['Eli decided to walk the entire route.','The first driver disliked passengers.','Eli made himself more visible to the next driver.','All buses were full that morning.'],answer:2,feedback:['He remains at the stop and signals the next bus.','The driver’s motive is absent from the text.','Moving to the curb and raising a hand both make his presence easier to notice.','The passage does not report how many riders were on either bus.']},
      summary:'State the claim in your own words. Match it to evidence. Reject answers that add motives, exceptions, or certainty the passage does not supply.',
      sources:['act-reading'],
    }],
  },{
    slug:'experimental-design',subject:'SCIENCE',domain:'Scientific Investigation',topic:'Experimental design',
    overview:'Isolate variables, choose useful controls, and decide what the results can show.',
    practiceTopics:['Experimental design','Conflicting viewpoints'],
    lessons:[{
      id:'comparison',title:'Design the comparison that answers the question',minutes:18,
      objectives:['Identify the independent and measured variables.','Choose a comparison that isolates one factor.','Explain the value of controls and repeated trials.'],
      prerequisites:['Read a row and a column from a data table.','Describe what changed in a two-condition comparison.'],
      instruction:[
        {title:'Name the input and outcome',body:'An independent variable is the factor intentionally changed. A dependent variable is measured to see the outcome. Conditions held constant are controls in the broader sense. A control group is a baseline condition, such as no treatment, that can show what happens without the experimental change.'},
        {title:'Change only the factor being tested',body:'If one cup is warmer and also uses a different container, you cannot tell which change explains a difference. Compare rows that match on other conditions. In a two-factor design, one matched pair gives an effect at one level of the other factor. Compare across both pairs to see whether the effect depends on that other level.'},
        {title:'Separate reliability and causal interpretation',body:'Repeating a trial gives an estimate less sensitive to one unusual measurement. It does not undo a confounded design. Equal starting amounts, a consistent measurement procedure, and comparable groups help establish that a difference is connected to the intended treatment.'},
      ],
      examples:[
        {title:'Recognize a controlled comparison',prompt:'Two groups of identical paper gliders use the same release height. Group 1 has no added clip. Group 2 has a clip. The mean flight distances are 2.1 m and 2.6 m.',steps:['The presence of the clip is the independent variable.','Flight distance is the measured outcome.','The no-clip group is the baseline. Their mean differs by 0.5 m under this setup.']},
        {title:'Find a confound',prompt:'A student puts equal volumes of warm water in a covered steel cup and an uncovered glass cup. The steel cup cools more slowly. Does that isolate an effect of material?',steps:['List differences across conditions: cup material and presence of a cover.','Both can plausibly affect cooling, so the measurements cannot separate them.','Repeat with a steel cup and a glass cup that have the same cover treatment and otherwise matched conditions.']},
        {title:'Compare the effect at two settings',prompt:'In still air, adding a shield changes water loss from 18 g to 15 g. In moving air, adding the same shield changes water loss from 35 g to 20 g. Is the observed effect constant?',steps:['Compare only matched air settings: $18-15=3$ g in still air.','The moving-air comparison gives $35-20=15$ g.','The observed reduction is larger in moving air. The data support different effects across the tested settings.']},
      ],
      pitfalls:['Comparing rows that change two factors.','Confusing the measured result with the treatment.','Claiming a causal effect from replication alone.'],
      timing:'Identify the factor named in the question. Trace rows to a pair that differs on only that factor, then compare the result column.',
      guided:{prompt:'A study tests whether lid color changes evaporation. Which pair isolates lid color?',hint:'Every other listed condition should match.',choices:['A red lid in sun and a blue lid in shade','An uncovered jar and a blue-lidded jar at the same temperature','A red lid on a large jar and a blue lid on a small jar','Red and blue lids on identical jars with equal water and the same light'],answer:3,feedback:['Both color and light change.','Lid presence changes, so this does not compare two colors.','Jar size changes along with color.','Lid color is the only listed difference.']},
      summary:'Match conditions before comparing outcomes. Baselines establish a reference and replication checks variation under each condition.',
      sources:['act-science'],
    }],
  },{
    slug:'argument-perspectives',subject:'WRITING',domain:'Ideas and Analysis',topic:'Analyze perspectives',
    overview:'Build a defensible thesis and explain how it relates to another view.',
    lessons:[{
      id:'thesis-and-response',title:'Write a thesis that engages another perspective',minutes:21,
      objectives:['State a position precise enough to defend.','Find the assumption behind a competing view.','Connect a concrete example to a reason.'],
      prerequisites:['Identify a claim and a supporting reason.','Paraphrase an opposing view fairly.'],
      instruction:[
        {title:'State a decision and its principal reason',body:'A thesis should tell the reader which option you favor and why. A more useful thesis can also name the condition that makes your choice sensible. Avoid announcing “This essay will discuss” without committing to a claim. A narrow stance with a clear reason supports more analysis than a broad position with no mechanism.'},
        {title:'Name the disagreement precisely',body:'Another perspective may share your goal while disagreeing on the best method. Explain the value or assumption beneath the difference. Grant the strongest point from that perspective, then show when it does or does not hold. This makes your comparison an argument instead of a list of views.'},
        {title:'Move from example to reasoning',body:'Use a specific example. Then spell out which part illustrates your reason and how the reason supports your position. For a hypothetical, label it as a hypothetical instead of inventing statistics. Close a paragraph by linking the evidence back to your thesis or by clarifying its limit.'},
      ],
      examples:[
        {title:'Turn a topic into a thesis',prompt:'A town can add weekend library hours or extend weeknight hours. Revise “Both schedules have benefits.”',steps:['Choose a priority, such as access for people with weekday evening jobs.','Make a specific recommendation: “The library should first open on Sundays because residents with weeknight shifts otherwise have few opportunities to visit.”','The scope “first” leaves room to test demand and add a second option later.']},
        {title:'Concede while preserving the position',prompt:'A critic says weeknight hours help students use the library right after activities.',steps:['Concede that a later evening can help students already nearby.','Name the different assumption: that students have transport home later.','Explain that weekend access may reach families who cannot make the evening trip, while a later pilot could test that assumption.']},
        {title:'Use an example without inventing evidence',prompt:'Support a proposal to loan equipment through a community center.',steps:['Offer a credible hypothetical: a family can borrow a tool for a one-day repair rather than buying it.','Explain why that example matters: short-term access can solve a temporary need at a lower personal cost.','Acknowledge a limit, such as maintenance. A tracking system and replacement fund address it better than pretending it does not exist.']},
      ],
      pitfalls:['Reciting each viewpoint without stating your own relationship to it.','Inventing numerical evidence.','Giving an example and then moving on before explaining its relevance.'],
      timing:'For a 40-minute essay, try 5 minutes to plan, 29 to draft, and 6 to revise. Use revision time to check that every body paragraph supports the thesis.',
      guided:{prompt:'Which thesis most clearly gives a proposal and engages a competing priority?',hint:'Look for a decision, a reason, and a concrete concession.',choices:['Many residents have different opinions about the library.','Weeknight hours are wrong, and everyone knows it.','The library should have better hours at some point.','The library should try Sunday hours first to serve shift workers, while still reserving one late weekday for students.'],answer:3,feedback:['The sentence introduces a topic without a decision.','This dismisses the other perspective without a reason.','The proposal lacks a specific action and audience.','The thesis makes a specific choice, names a reason, and shows how it accounts for a competing need.']},
      summary:'Commit to a clear position. Explain a competing priority fairly, then connect evidence to your reasoning.',
      sources:['act-writing'],
    }],
  },
];
