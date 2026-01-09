import { z } from 'zod';

export const LLMRequestSchema = z.object({
  model: z.string(),
  systemPrompt: z.string().optional(),
  inputs: z.array(z.object({
    type: z.enum(['text', 'image']),
    content: z.string(),
  })),
});

export const LLMResponseSchema = z.object({
  success: z.boolean(),
  output: z.string().optional(),
  error: z.string().optional(),
});

export type LLMRequest = z.infer<typeof LLMRequestSchema>;
export type LLMResponse = z.infer<typeof LLMResponseSchema>;
