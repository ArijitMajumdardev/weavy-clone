
import { router } from '../trpc';
import { llmRouter } from './llm';
import { testRouter } from './test';
import { workflowRouter } from './workflow';

/**
 * Main tRPC router
 * All routers should be added here
 */
export const appRouter = router({
  llm: llmRouter,
  workflow: workflowRouter,
  test:testRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
