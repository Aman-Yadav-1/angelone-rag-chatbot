const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

async function testOpenRouter() {
  console.log('Testing OpenRouter API with key:', API_KEY ? '***' + API_KEY.slice(-4) : 'No key found');
  
  if (!API_KEY) {
    console.error('Error: No API key found in environment variables');
    console.log('Make sure to set NEXT_PUBLIC_OPENROUTER_API_KEY in your .env.local file');
    return;
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AngelOne Chatbot Test'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello, can you hear me?' }
        ]
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('Error response from OpenRouter:', data);
    } else {
      console.log('Success! Response:', data.choices?.[0]?.message?.content);
    }
  } catch (error) {
    console.error('Error making request to OpenRouter:', error);
  }
}

testOpenRouter();
