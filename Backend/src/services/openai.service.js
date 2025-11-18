// Optional OpenAI integration (light wrapper)
const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function summarize(text) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
  const resp = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: `Summarize: ${text}` }],
    max_tokens: 300
  });
  return resp.choices?.[0]?.message?.content || '';
}

module.exports = { summarize };
