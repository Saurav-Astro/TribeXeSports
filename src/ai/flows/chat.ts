'use server';
/**
 * @fileOverview A gaming expert chatbot AI flow.
 *
 * - chat - A function that handles the chatbot conversation.
 * - ChatInput - The input type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.any()),
  })).describe('The chat history.'),
  prompt: z.string().describe('The user\'s latest message.'),
});

const offTopicResponses = [
  "Whoa there, that’s offside! I only play in the gaming league.",
  "Error 404: Non-gaming topic detected 👀.",
  "That question just rage-quit my brain — talk gaming, buddy!",
  "Bruh… I’m a gamer bot, not your life coach 😂.",
  "That’s not in my quest log. Try something about games!",
  "Hold up! My XP doesn’t cover non-gaming topics.",
  "Umm… unless that’s a hidden Easter egg, it’s not gaming-related.",
  "You’re out of bounds! Let’s respawn back to gaming talk.",
  "My devs told me to avoid spoilers… about real life 😅.",
  "Invalid move, player! Only gaming topics unlock rewards.",
];

export type ChatInput = z.infer<typeof ChatInputSchema>;

export async function chat(input: ChatInput): Promise<string> {
  const response = await gamingChatFlow(input);
  if (!response) {
      throw new Error('No response from AI');
  }
  
  if (response.trim() === 'OFF_TOPIC') {
    const randomIndex = Math.floor(Math.random() * offTopicResponses.length);
    return offTopicResponses[randomIndex];
  }
  
  return response;
}

const gamingChatFlow = ai.defineFlow(
  {
    name: 'gamingChatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { history, prompt } = input;
    
    const response = await ai.generate({
      prompt: prompt,
      history: history.map(h => ({ role: h.role, content: h.content.map(c => ({ text: c.text }))})),
      system: `You are a gaming expert AI assistant for TribeXeSports. Your knowledge is strictly limited to video games, eSports, and gaming culture. Your tone should be enthusiastic and helpful. Format your responses using simple HTML for readability, including <strong> for bolding and <ol>/<ul>/<li> for lists. Do not use markdown. If a user asks about something unrelated to gaming, you MUST reply with only the exact text: "OFF_TOPIC". Do not add any other words or formatting.`,
    });

    return response.text;
  }
);
