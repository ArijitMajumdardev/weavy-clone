import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/context';

/**
 * tRPC API handler for App Router
 * Handles all tRPC requests
 */
const handler = async (req: Request) => {
  try {
    return await fetchRequestHandler({
      endpoint: "/api/trpc",
      req,
      router: appRouter,
      createContext
    });
  } catch (err) {
    console.error("tRPC handler error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export { handler as GET, handler as POST };
