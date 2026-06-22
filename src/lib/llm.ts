import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '@/config/prompt';

// Use OpenRouter
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function callLLMForReplies(
  model: string,
  prompt: string,
  systemPrompt: string = SYSTEM_PROMPT,
): Promise<{ type: string; text: string }[]> {

  let raw = '';


  const completion = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
  });
  raw = completion.choices[0].message?.content ?? '';

  // Parse JSON replies
  try {
    const json = JSON.parse(raw);
    if (Array.isArray(json.replys)) {
      return json.replys;
    }
    if (Array.isArray(json.replies)) {
      return json.replies;
    }
    throw new Error('Missing "replys" or "replies" field in output');
  } catch {
    throw new Error('Failed to parse JSON response: ' + raw);
  }
}

export async function callLLMForText(model: string, prompt: string, systemPrompt: string = '', openrouterKey: string)
  : Promise<string> {

  let raw = '';

  const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: openrouterKey,
  });
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const completion = await openai.chat.completions.create({
    model: model,
    messages: messages as any,
  });
  raw = completion.choices[0].message?.content ?? '';

  return raw.trim();
}

