const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Keep model selection server-side and configurable as Groq retires models.
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const MAX_COMPLETION_TOKENS = Number(process.env.GROQ_MAX_COMPLETION_TOKENS || 8192);

async function callGroq(prompt, systemPrompt = "You are a helpful AI assistant.", isJSON = true, model = DEFAULT_MODEL) {
  try {
    const params = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      model: model,
      temperature: 0.1,
      max_completion_tokens: MAX_COMPLETION_TOKENS,
    };

    if (model.startsWith('openai/')) params.reasoning_effort = process.env.GROQ_REASONING_EFFORT || 'low';
    
    if (isJSON) {
      params.response_format = { type: 'json_object' };
    }

    const chatCompletion = await groq.chat.completions.create(params);
    const content = chatCompletion.choices[0]?.message?.content;
    
    if (isJSON) {
      try {
        // Sometimes LLMs wrap JSON in markdown block even in JSON mode
        const cleanedContent = content.replace(/^```json\n?/, '').replace(/```$/, '').trim();
        return JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error("Failed to parse JSON:", content);
        throw parseError;
      }
    }
    return content;
  } catch (error) {
    console.error("Groq API Error:", error?.error || error);
    throw new Error(error?.error?.message || "Failed to process with Groq AI");
  }
}

module.exports = {
  callGroq,
  DEFAULT_MODEL,
};
