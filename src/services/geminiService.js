const { GoogleGenerativeAI } = require('@google/generative-ai');

const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash-lite'
  });

  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 Gemini attempt ${attempt}/${maxRetries}`);

      const result = await model.generateContent(prompt);

      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Invalid Gemini response');
      }

      console.log('✅ Gemini response received');

      return text;

    } catch (error) {
      console.error(`❌ Gemini attempt ${attempt} failed:`, error.message);

      // Retry only for temporary server errors
      if (error.message.includes('503') && attempt < maxRetries) {
        const waitTime = attempt * 5000;

        console.log(`⏳ Waiting ${waitTime / 1000} seconds before retry...`);

        await new Promise(resolve => setTimeout(resolve, waitTime));

        continue;
      }

      throw error;
    }
  }
};

module.exports = {
  callGemini,
};