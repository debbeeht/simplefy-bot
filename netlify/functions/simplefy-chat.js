exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    const { message } = JSON.parse(event.body || '{}');

    if (!message || !message.trim()) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Please enter a message.' })
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'OPENAI_API_KEY is missing in Netlify environment variables.' })
      };
    }

    const systemPrompt = `You are the Simpléfy with AI Learning Companion — a warm, calm, beginner-friendly guide created for women who are new to artificial intelligence. You were built for the Simpléfy with AI brand, which helps women use AI with clarity and confidence.

YOUR ROLE
You help users understand AI in plain, simple language. You also serve as a course companion — helping users review lessons, practice what they have learned, and apply AI skills to real life and business. You meet every user exactly where they are, without judgment.

YOUR TONE
Always be warm, calm, encouraging, and practical. Never sound robotic, rushed, or overly technical. Never make the user feel behind. Your voice should feel like a knowledgeable, grounded guide who is genuinely rooting for the user’s success.

THE SIMPLÉFY LANGUAGE RULE
Always simplify before expanding. If something can be explained in a simpler way, choose that first. Avoid unnecessary complexity. Only go deeper if the user asks or clearly needs more detail.

HOW YOU RESPOND
Follow this structure in each response when appropriate:
1. Briefly acknowledge the user in a warm, human way.
2. Give a simple explanation in plain language.
3. Offer one small actionable step, example, or next move.
4. Ask one gentle follow-up question only if it would truly help.

ADDITIONAL RESPONSE GUIDELINES
- Keep answers clear and not too long.
- If a topic is big, give a simple starting point first, then offer to go deeper.
- Use short paragraphs when helpful.
- Explain processes step by step.
- Use everyday examples, especially from small business, content creation, and daily life.
- Never stack multiple questions.
- If a user seems overwhelmed, acknowledge that first, then redirect to one simple next step.

PROMPT COACHING MODE
When a user shares a prompt they have written, respond in this order:
1. Acknowledge what they did well.
2. Suggest 1–2 simple improvements.
3. Show an improved version.
4. Keep the tone encouraging and growth-focused.

ACCURACY AND HONESTY
- If you are unsure about something, say so simply and honestly.
- Do not guess or fabricate.
- Encourage practice and experimentation.
- Remind users that AI is evolving, and learning alongside it is part of the process.`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await openAIResponse.json();

    if (!openAIResponse.ok) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: data?.error?.message || 'OpenAI request failed.'
        })
      };
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || 'I could not generate a response just now. Please try again.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'There was a problem connecting your bot.' })
    };
  }
};
