export type Inventory = {
  practice: Record<string,Record<string,number>>;
  due: Record<string,number>;
  holdouts: Record<string,number>;
};

export function availablePractice(inventory: Inventory, mode: string, subject: string, topic: string) {
  if (mode==='review') {
    return subject ? inventory.due[subject] ?? 0 : sum(Object.values(inventory.due));
  }
  if (mode==='topic'||(mode==='timed'&&topic)) return inventory.practice[subject]?.[topic] ?? 0;
  if (subject) return sum(Object.values(inventory.practice[subject] ?? {}));
  return sum(Object.values(inventory.practice).map(topics=>sum(Object.values(topics))));
}

function sum(values: number[]) {
  return values.reduce((total,value)=>total+value,0);
}

export type ExamTemplate = {subject:string;question_count:number;minutes:number;optional:boolean};
