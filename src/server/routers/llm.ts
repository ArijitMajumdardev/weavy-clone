import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { getGeminiClient } from "@/lib/gemini";
import { LLMRequestSchema } from "@/types/api";

export const llmRouter = router({
  generateContent: protectedProcedure
    .input(LLMRequestSchema)
    .mutation(async ({ input }) => {
      try {
        const { systemPrompt, inputs } = input;

        const genAI = getGeminiClient();

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const parts: any[] = [];

        if (systemPrompt) {
          parts.push({ text: `System: ${systemPrompt}\n\n` });
        }

        for (const userInput of inputs) {
          if (userInput.type === "text") {
            parts.push({ text: userInput.content });
          } else if (userInput.type === "image") {
            const matches = userInput.content.match(/^data:(.+);base64,(.+)$/);
            if (matches) {
              const mimeType = matches[1];
              const base64Data = matches[2];
              parts.push({
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              });
            }
          }
        }

        const result = await model.generateContent(parts);
        const response = result.response;
        const output = response.text();

        return {
          success: true as const,
          output,
        };
      } catch (error) {
        console.error("LLM API Error:", error);

        let errorMessage = "An unknown error occurred";

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        return {
          success: false as const,
          error: errorMessage,
        };
      }
    }),
});
