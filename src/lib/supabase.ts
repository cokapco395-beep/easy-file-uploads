import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://npxixwhfxekallsfmbfb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weGl4d2hmeGVrYWxsc2ZtYmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjUzMzMsImV4cCI6MjA5MDM0MTMzM30.Qp6dt19kUyoZ9Z1YHWlMfUPqKifRyRr1iV2fiiGY0Gc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// AlemLLM AI API
export const ALEM_AI_URL = 'https://llm.alem.ai/v1/chat/completions';
export const ALEM_AI_KEY = 'sk-I3ehqk94TiQHwW3V5SS0RQ';

export async function callAlemAI(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const res = await fetch(ALEM_AI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ALEM_AI_KEY}`,
      },
      body: JSON.stringify({
        model: 'o4-mini',
        messages,
        max_tokens: 1024,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'Нет ответа от ИИ';
  } catch (e) {
    console.error('AlemAI error:', e);
    return 'Ошибка подключения к ИИ. Попробуйте позже.';
  }
}
