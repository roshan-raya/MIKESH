export type WorkedExample = {
  title: string;
  prompt: string;
  steps: string[];
  table?: {caption:string; headings:string[]; rows:string[][]};
};

export type GuidedExercise = {
  prompt: string;
  hint: string;
  choices: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  feedback: [string, string, string, string];
};

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  objectives: string[];
  prerequisites: string[];
  dependsOn?: string;
  instruction: {title:string; body:string}[];
  examples: [WorkedExample, WorkedExample, WorkedExample];
  pitfalls: string[];
  timing: string;
  guided: GuidedExercise;
  summary: string;
  sources: string[];
};

export type ChapterLevel = 'beginner'|'intermediate'|'standard'|'advanced';
export type ConceptNode = {id:string;level:ChapterLevel;prerequisites:string[]};

export type Course = {
  slug: string;
  subject: 'MATH'|'ENGLISH'|'READING'|'SCIENCE'|'WRITING';
  domain: string;
  topic: string;
  overview: string;
  lessons: Lesson[];
  next?: string;
  practiceTopics?: string[];
  concepts?: ConceptNode[];
  draftPracticeCount?: number;
};
