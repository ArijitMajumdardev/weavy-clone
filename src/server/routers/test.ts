import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const testRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return {
        message: `Hello , tRPC is working!`,
      };
    }),

  ping: publicProcedure.query(() => {
    return { ok: true };
  }),
});
