import { router } from "../trpc";
import { llmRouter } from "./llm";
import { testRouter } from "./test";
import { workflowRouter } from "./workflow";

export const appRouter = router({
  llm: llmRouter,
  workflow: workflowRouter,
  test: testRouter,
});

export type AppRouter = typeof appRouter;
