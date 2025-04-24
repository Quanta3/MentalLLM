// controllers/queryController.js
import { GoogleGenAI } from '@google/genai';


const textController = async (req, res) => {

  const api_key = process.env.GOOGLE_API_KEY
  const ai = new GoogleGenAI({ apiKey: api_key});
  const { userQuery } = req.body;

  console.log(api_key)
  if (!userQuery) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    // Get the system prompt from the environment
    const systemPrompt = process.env.SYSTEM_PROMPT;

    // Generate content using the Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `${systemPrompt}\nUser: HII BRO`,
    });
    

    // Send the response back to the user
    res.status(200).json({ response: response.text });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default textController;
