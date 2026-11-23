import { z } from 'zod';

export const subjects = ['ENGLISH', 'MATH', 'READING', 'SCIENCE'] as const;
export const startSchema = z.object({
  mode: z.enum(['learn', 'topic', 'adaptive', 'diagnostic', 'timed', 'mock', 'review', 'writing']),
  subject: z.enum(subjects).nullable().default(null),
  topic: z.string().trim().min(1).max(120).nullable().default(null),
  count: z.number().int().min(1).max(50).default(8),
  science: z.boolean().default(false),
}).superRefine((input, context) => {
  if ((input.mode === 'topic' && (!input.topic || !input.subject)) || (input.mode === 'timed' && !input.subject)) {
    context.addIssue({ code: 'custom', message: 'Choose a subject and any required topic.' });
  }
});

export const updateSchema = z.object({
  session: z.string().uuid(),
  action: z.enum(['save', 'check', 'submit']),
  position: z.number().int().min(1).default(1),
  answer: z.enum(['A', 'B', 'C', 'D', 'E']).nullable().default(null),
  flagged: z.boolean().default(false),
  confidence: z.enum(['sure', 'unsure', 'guess']).nullable().default(null),
  seconds: z.number().int().min(0).max(7200).default(0),
  essay: z.string().max(25000).nullable().default(null),
});

export function remainingSeconds(deadline: string, now = Date.now()) {
  return Math.max(0, Math.ceil((Date.parse(deadline) - now) / 1000));
}

export function composite(scores: number[]) {
  if (scores.length !== 3 || scores.some(score => !Number.isInteger(score) || score < 1 || score > 36)) {
    throw new RangeError('Three ACT section scores from 1 to 36 are required.');
  }
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / 3);
}
