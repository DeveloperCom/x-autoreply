import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '@/config/prompt';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function callLLM(model: string, prompt: string) {
    const completion = await openai.chat.completions.create({
        model: model,
        messages: [
            {
                role: 'system',
                content: SYSTEM_PROMPT
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
    });

    const raw = completion.choices[0].message?.content ?? '';

    let replies: { type: string; text: string }[] = [];

    try {
        const json = JSON.parse(raw);
        if (Array.isArray(json.replys)) {
            replies = json.replys;
        } else {
            throw new Error('Missing or invalid "replys" array');
        }
    } catch (e) {
        throw new Error('Failed to parse JSON');
    }

    return replies;
}

