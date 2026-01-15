import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import prisma from "@/lib/prisma";

export const workflowRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;

    if (!userId) {
      throw new Error("Unauthorized: No user ID found");
    }

    const workflows = await prisma.workflow.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return workflows;
  }),

  search: protectedProcedure
    .input(
      z.object({
        query: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;

      if (!userId) {
        throw new Error("Unauthorized: No user ID found");
      }

      if (!input.query.trim()) {
        const workflows = await prisma.workflow.findMany({
          where: { userId },
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
        });
        return workflows;
      }

      const workflows = await prisma.workflow.findMany({
        where: {
          userId,
          name: {
            contains: input.query,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      return workflows;
    }),

  create: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;

      if (!userId) {
        throw new Error("Unauthorized: No user ID found");
      }

      console.log("Creating workflow with ID:", input.id, "for user:", userId);
      const workflow = await prisma.workflow.create({
        data: {
          id: input.id,
          name: input.name,
          nodes: [],
          edges: [],
          userId: userId,
        },
      });
      return workflow;
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;

      if (!userId) {
        throw new Error("Unauthorized: No user ID found");
      }

      const workflow = await prisma.workflow.findUnique({
        where: { id: input.id },
      });

      if (!workflow) {
        throw new Error("Workflow not found");
      }

      if (workflow.userId !== userId) {
        throw new Error("Unauthorized: You don't have access to this workflow");
      }

      return workflow;
    }),

  updateName: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;

      if (!userId) {
        throw new Error("Unauthorized: No user ID found");
      }

      const existingWorkflow = await prisma.workflow.findUnique({
        where: { id: input.id },
      });

      if (!existingWorkflow) {
        throw new Error("Workflow not found");
      }

      if (existingWorkflow.userId !== userId) {
        throw new Error("Unauthorized: You don't have access to this workflow");
      }

      const workflow = await prisma.workflow.update({
        where: { id: input.id },
        data: { name: input.name },
      });
      return workflow;
    }),

  saveData: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nodes: z.any(),
        edges: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;

      if (!userId) {
        throw new Error("Unauthorized: No user ID found");
      }

      const existingWorkflow = await prisma.workflow.findUnique({
        where: { id: input.id },
      });

      if (!existingWorkflow) {
        throw new Error("Workflow not found");
      }

      if (existingWorkflow.userId !== userId) {
        throw new Error("Unauthorized: You don't have access to this workflow");
      }

      const workflow = await prisma.workflow.update({
        where: { id: input.id },
        data: {
          nodes: input.nodes,
          edges: input.edges,
        },
      });
      return workflow;
    }),

  getData: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;

      if (!userId) {
        throw new Error("Unauthorized: No user ID found");
      }

      const workflow = await prisma.workflow.findUnique({
        where: { id: input.id },
        select: {
          nodes: true,
          edges: true,
          userId: true,
        },
      });

      if (!workflow) {
        throw new Error("Workflow not found");
      }

      if (workflow.userId !== userId) {
        throw new Error("Unauthorized: You don't have access to this workflow");
      }

      return {
        nodes: workflow.nodes,
        edges: workflow.edges,
      };
    }),
});
