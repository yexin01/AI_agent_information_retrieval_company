import { GoogleGenAI } from '@google/genai';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY is not set. Requests to the Gemini API will fail.');
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const generatePrompt = (companyQuery) => `
// ROLE
You are an automated web research bot.

// TASK
Your task is to use the \`googleSearch\` tool to find public information about the company: "${companyQuery}". You must then structure this information into the required JSON format.

// OUTPUT RAW JSON ONLY
Please output only the JSON object.
`;

app.post('/api/generate-company', async (req, res) => {
  const { companyQuery } = req.body || {};
  if (!companyQuery) return res.status(400).json({ error: 'companyQuery is required in the request body' });

  if (!ai) {
    return res.status(500).json({ ok: false, error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: generatePrompt(companyQuery),
      config: { tools: [{ googleSearch: {} }] },
    });

    return res.json({ ok: true, text: response.text, candidates: response.candidates || [] });
  } catch (err) {
    console.error('Error calling Gemini API:', err);
    return res.status(500).json({ ok: false, error: (err && err.message) || String(err) });
  }
});

app.post('/api/chat', async (req, res) => {
  const { message, options, companyContext } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: 'message is required in the request body' });
  }

  if (!ai) {
    return res.status(500).json({ ok: false, error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  try {
    const { isWebSearchEnabled = false, model = 'gemini-2.5-flash' } = options || {};

    let content = message;
    if (companyContext) {
      content = `Given the context that I am looking at a company profile for "${companyContext}", answer the following question: ${message}`;
    }

    const systemInstructions = [
      "You are a helpful AI assistant specializing in business and financial topics. Your name is Profile Agent Assistant.",
      "Answer questions clearly and concisely.",
      "You can use Markdown for formatting your responses, such as using bolding with asterisks (*bold*) or bullet points with hyphens (-)."
    ];

    const config = {
      systemInstruction: systemInstructions.join('\n')
    };

    let tools = undefined;
    if (isWebSearchEnabled) {
      tools = [{ googleSearch: {} }];
      systemInstructions.push("When asked for up-to-date information, news, or recent events, you MUST use the provided Google Search tool to find the most current and accurate answers. Base your responses on the search results.");
      config.systemInstruction = systemInstructions.join('\n');
    }

    // Add thinking config for Pro model
    if (model === 'gemini-2.5-pro') {
      config.thinkingConfig = { thinkingBudget: 32768 };
      systemInstructions.push("You are now in Pro mode. Take your time to provide thorough, insightful, and well-reasoned answers, even for complex or abstract questions. Leverage your advanced reasoning capabilities.");
      config.systemInstruction = systemInstructions.join('\n');
    }

    const response = await ai.models.generateContent({
      model,
      contents: content,
      config,
      tools,
    });

    const text = response.text;
    if (!text) {
      throw new Error("The model returned an empty response.");
    }

    const chatResponse = { ok: true, text };

    // Extract grounding sources if web search was enabled
    if (isWebSearchEnabled) {
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const sources = [];
      if (groundingMetadata?.groundingChunks) {
        for (const chunk of groundingMetadata.groundingChunks) {
          if (chunk.web) {
            sources.push({
              uri: chunk.web.uri,
              title: chunk.web.title || "Untitled Source",
            });
          }
        }
      }
      chatResponse.sources = sources;
    }

    return res.json(chatResponse);
  } catch (err) {
    console.error('Error calling Gemini API for chat:', err);
    return res.status(500).json({ ok: false, error: (err && err.message) || String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
