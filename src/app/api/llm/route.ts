import { NextRequest, NextResponse } from 'next/server';
import { LLMRequestSchema, LLMResponse } from '@/types/api';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = LLMRequestSchema.parse(body);

    const { systemPrompt, inputs } = validatedData;

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
    for (const input of inputs) {
      if (input.type === 'text') {
        parts.push({ text: input.content });
      } else if (input.type === 'image') {
        // input.content is base64 encoded string
        // Extract mime type and data from base64 string
        const matches = input.content.match(/^data:(.+);base64,(.+)$/);
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

    const successResponse: LLMResponse = {
      success: true,
      output,
    };

    return NextResponse.json(successResponse);

  } catch (error) {
    console.error('LLM API Error:', error);

    let errorMessage = 'An unknown error occurred';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    const errorResponse: LLMResponse = {
      success: false,
      error: errorMessage,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
