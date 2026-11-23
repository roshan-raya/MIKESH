export const difficultyBands={
  all:[1,5],
  foundational:[1,2],
  intermediate:[3,3],
  advanced:[4,5],
} as const;

export type CourseInventory={topic:string;difficulty:number;total:number;unseen:number};
