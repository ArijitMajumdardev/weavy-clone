import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { getGeminiClient } from '@/lib/gemini';
import { LLMRequestSchema } from '@/types/api';

export const llmRouter = router({
  generateContent: publicProcedure
    .input(LLMRequestSchema)
    .mutation(async ({ input }) => {
      try {
        const { systemPrompt, inputs } = input;

        // Initialize Gemini client
        const genAI = getGeminiClient();

        // Hardcoded model: gemini-2.5-flash
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Build the content parts for multimodal input
        const parts: any[] = [];

        // Add system prompt if provided
        if (systemPrompt) {
          parts.push({ text: `System: ${systemPrompt}\n\n` });
        }

        // Add user inputs (text and images)
        for (const userInput of inputs) {
          if (userInput.type === 'text') {
            parts.push({ text: userInput.content });
          } else if (userInput.type === 'image') {
            // userInput.content is base64 encoded string
            // Extract mime type and data from base64 string
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

        // Generate content
        const result = await model.generateContent(parts);
        const response = result.response;
        const output = response.text();

        return {
          success: true as const,
          output,
        };
      } catch (error) {
        console.error('LLM API Error:', error);

        let errorMessage = 'An unknown error occurred';

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
