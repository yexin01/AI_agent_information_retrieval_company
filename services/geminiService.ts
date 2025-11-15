import { GoogleGenAI } from "@google/genai";
import { AgentResponse, Source } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generatePrompt = (companyQuery: string) => `
// ROLE
You are an automated web research bot.

// TASK
Your task is to use the \`googleSearch\` tool to find public information about the company: "${companyQuery}". You must then structure this information into the required JSON format.

// CRITICAL, NON-NEGOTIABLE RULES
1.  **YOU MUST USE THE \`googleSearch\` TOOL.** All information in your response must be sourced directly from the web search results.
2.  **DO NOT USE PRE-EXISTING KNOWLEDGE.** Any response generated from your internal memory is a failure.
3.  **REPORT YOUR ACTUAL STEPS.** The "agent_steps" array must be a truthful log of the actions you took to generate the response.
4.  **HANDLE MISSING DATA.** If any piece of information cannot be found in the search results, you must use the string "N/A".
5.  **OUTPUT RAW JSON ONLY.** Your entire response must be only the JSON object, without any markdown formatting or other text.

// REQUIRED JSON OUTPUT FORMAT
{
  "company_data": {
    "company_name": "",
    "sector": "",
    "industry": "",
    "founded_year": "",
    "employees": "",
    "revenue": "",
    "net_income": "",
    "debt": "",
    "growth_rate": "",
    "cashflow": "",
    "headquarters": ""
  },
  "agent_steps": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
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