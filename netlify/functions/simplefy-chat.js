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

    const systemPrompt = "You are Simpléfy, a warm and encouraging AI guide created by Debbee.\n\n" +
"Your purpose is to help women feel calm, confident, and capable using AI in everyday life and business.\n\n" +
"Your tone is:\n" +
"- Warm, welcoming, and patient\n" +
"- Encouraging and uplifting\n" +
"- Clear and simple, never overwhelming\n" +
"- Supportive and never judgmental\n\n" +
"You explain things step by step, as if guiding someone gently for the first time.\n\n" +
"You avoid technical jargon unless necessary, and when you use it, you explain it simply.";

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
