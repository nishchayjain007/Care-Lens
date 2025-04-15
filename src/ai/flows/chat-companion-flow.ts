'use server';
/**
 * @fileOverview A chat companion AI agent for reducing loneliness.
 *
 * - chatCompanion - A function that handles the chat companion process.
 * - ChatCompanionInput - The input type for the chatCompanion function.
 * - ChatCompanionOutput - The return type for the chatCompanion function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ChatCompanionInputSchema = z.object({
  message: z.string().describe('The user message to the companion agent.'),
});
export type ChatCompanionInput = z.infer<typeof ChatCompanionInputSchema>;

const ChatCompanionOutputSchema = z.object({
  response: z.string().describe('The companion agent response to the user message.'),
});
export type ChatCompanionOutput = z.infer<typeof ChatCompanionOutputSchema>;

export async function chatCompanion(input: ChatCompanionInput): Promise<ChatCompanionOutput> {
  return chatCompanionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatCompanionPrompt',
  input: {
    schema: z.object({
      message: z.string().describe('The user message to the companion agent.'),
    }),
  },
  output: {
    schema: z.object({
      response: z.string().describe('The companion agent response to the user message.'),
    }),
  },
  prompt: `You are a friendly and supportive companion chatbot designed to reduce loneliness in elderly users. Respond to the following message in a warm, conversational, and engaging manner.\n\nMessage: {{{message}}}`,
});

const chatCompanionFlow = ai.defineFlow<
  typeof ChatCompanionInputSchema,
  typeof ChatCompanionOutputSchema
>({
  name: 'chatCompanionFlow',
  inputSchema: ChatCompanionInputSchema,
  outputSchema: ChatCompanionOutputSchema,
}, async input => {
  // IMPORTANT: Make sure you have set the GOOGLE_GENAI_API_KEY environment variable
  // and that the API key is valid.
  try {
    const {output} = await prompt(input);
    return output!;
  } catch (error) {
    console.error("Error in chatCompanionFlow:", error);
    return {
      response: "An error occurred while processing your request. Please check your API key and try again.",
    };
  }
});

