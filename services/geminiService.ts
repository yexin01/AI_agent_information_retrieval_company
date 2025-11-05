import { GoogleGenAI } from "@google/genai";
import { AgentResponse, Source } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generatePrompt = (companyQuery: string) => `
Act as a Web Research Agent. Your sole mission is to find and structure public company information based *exclusively* on Google Search results.

CRUCIAL INSTRUCTIONS:
1.  You MUST use the Google Search tool provided. Do not use your internal knowledge.
2.  Your entire response MUST be grounded in the information you find from the search results.
3.  If you cannot find a specific piece of information, you MUST use "N/A" as the value. Do not make up data.
4.  Your final output must be a single, raw JSON object, with no markdown formatting (like \`\`\`json) or any other text.

THE TASK:
For the company "${companyQuery}", perform a web search and return a JSON object with two keys: "company_data" and "agent_steps".

JSON STRUCTURE:
{
  "company_data": {
    "company_name": "...",
    "founded_year": "...",
    "employees": "...",
    "revenue": "...",
    "net_income": "...",
    "debt": "...",
    "growth_rate": "...",
    "cashflow": "...",
    "headquarters": "..."
  },
  "agent_steps": [
    "Step 1: Description of action taken.",
    "Step 2: Description of action taken.",
    "..."
  ]
}
`;

export const fetchCompanyData = async (companyQuery: string): Promise<AgentResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: generatePrompt(companyQuery),
      config: {
        tools: [{googleSearch: {}}],
      },
    });
    
    const text = response.text;
    if (!text) {
      throw new Error("The model returned an empty response.");
    }

    let parsedResponse;
    try {
      const cleanJsonString = text.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
      parsedResponse = JSON.parse(cleanJsonString);
    } catch (e) {
      console.error("Failed to parse JSON response from model:", text);
      throw new Error("Could not process the data from the AI. The format was unexpected.");
    }
    
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources: Source[] = [];
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

    if (!parsedResponse.company_data || !parsedResponse.agent_steps) {
        throw new Error("The AI response is missing required fields (company_data or agent_steps).");
    }
    
    const dataValues = Object.values(parsedResponse.company_data);
    // Check if the agent returned any data beyond just the company name or N/A values.
    const hasMeaningfulData = dataValues.some(val => val && val !== 'N/A' && val !== 0 && val !== '');
    
    if (hasMeaningfulData && sources.length === 0) {
      throw new Error("The AI agent provided data but failed to cite its sources. Please try the search again for reliable results.");
    }

    const agentResponse: AgentResponse = {
      company_data: {
          ...parsedResponse.company_data,
          last_updated: '' // This will be set in App.tsx
      },
      agent_steps: parsedResponse.agent_steps,
      sources: sources,
    };
    
    return agentResponse;
  } catch (error) {
    console.error("Error fetching company data from Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to fetch company data: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching company data.");
  }
};