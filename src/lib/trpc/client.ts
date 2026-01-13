'use client'
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app';

/**
 * Typed tRPC React hooks
 * Use these hooks throughout your application
 */
export const trpc = createTRPCReact<AppRouter>({});
