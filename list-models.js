const { GoogleGenerativeAI } = require("@google/generative-ai");

require('dotenv').config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`);
    const data = await response.json();
    console.log(data.models.map(m => m.name).join('\n'));
  } catch (error) {
    console.error("Error fetching models", error);
  }
}

listModels();
