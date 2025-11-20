import { GoogleGenAI } from "@google/genai";
import { AgentResponse, Source } from '../types';

// On the server we may use the SDK, but in the browser we should call our
// server proxy to avoid exposing API keys. This file will prefer the proxy
// when `window`/`fetch` are available.
const isBrowser = typeof window !== 'undefined' && typeof window.fetch === 'function';

// Initialize SDK client only when running in Node (server-side).
let ai: any = null;
if (!isBrowser) {
  const geminiApiKey = process.env?.GEMINI_API_KEY || process.env?.API_KEY;
  ai = new GoogleGenAI({ apiKey: geminiApiKey });
}

const generatePrompt = (companyQuery: string) => `
// ROLE
You are an automated web research bot.

// TASK
Your task is to use the \`googleSearch\` tool to find public information about the company: "${companyQuery}". You must then structure this information into the required JSON format.

// CRITICAL, NON-NEGOTIABLE RULES
1.  **YOU MUST USE THE \`googleSearch\` TOOL.** All information in your response must be sourced directly from the web search results.
2.  **DO NOT USE PRE-EXISTING KNOWLEDGE.** Any response generated from your internal memory is a failure.
3.  **REPORT YOUR ACTUAL STEPS.** The "agent_steps" array must be a truthful log of the actions you took to generate the response.
4.  **HANDLE MISSING DATA.** If any piece of information cannot be found in the search results, you must use the string "N/A". This includes all fields in the stock_data and financial_ratios objects if the company is not publicly traded. For trend data, provide an empty array [] if no historical data is found.
5.  **PROVIDE 5-YEAR TRENDS.** For revenue, net_income, and cashflow, you must provide data for the last 5 years. The top-level fields (e.g., "revenue") should contain the value for the most recent year.
6.  **OUTPUT RAW JSON ONLY.** Your entire response must be only the JSON object, without any markdown formatting or other text.

// REQUIRED JSON OUTPUT FORMAT
{
  "company_data": {
    "company_name": "",
    "description": "A brief, one-paragraph summary of the company's business and mission.",
    "sector": "",
    "industry": "",
    "founded_year": "",
    "employees": "",
    "revenue": "The most recent year's revenue.",
    "net_income": "The most recent year's net income.",
    "cashflow": "The most recent year's operating cash flow.",
    "debt": "",
    "growth_rate": "",
    "headquarters": "",
    "stock_data": {
      "price": "Current stock price, as a string.",
      "change": "Today's price change as a string (e.g., '-1.25' or '+2.50').",
      "change_percent": "Today's percentage change as a string (e.g., '-0.5%' or '+1.2%').",
      "market_cap": "Company's market capitalization as a string.",
      "chart_url": "A direct URL to a stock chart (e.g., Google Finance, Yahoo Finance)."
    },
    "financial_ratios": {
      "pe_ratio": "Price-to-Earnings ratio as a string.",
      "eps": "Earnings Per Share as a string.",
      "roe": "Return on Equity as a string (e.g., '15.2%')."
    },
    "revenue_trend": [
      { "year": 2023, "value": "500B USD" },
      { "year": 2022, "value": "450B USD" }
    ],
    "net_income_trend": [
      { "year": 2023, "value": "100B USD" },
      { "year": 2022, "value": "90B USD" }
    ],
    "cashflow_trend": [
      { "year": 2023, "value": "120B USD" },
      { "year": 2022, "value": "110B USD" }
    ]
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
    // If we're in the browser, call the local proxy endpoint so the API key
    // never reaches the client. The server will use the SDK or REST fallback.
    if (isBrowser) {
      try {
        const resp = await fetch('/api/generate-company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyQuery }),
        });

        const json = await resp.json();
        if (!resp.ok || !json.ok) {
          throw new Error(json.error || `Proxy error (status ${resp.status})`);
        }

        // Attempt to parse the returned text as JSON (the model returns JSON).
        const text = json.text || '';
        const cleanJsonString = text.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
        const parsedResponse = JSON.parse(cleanJsonString || '{}');

        const sources: Source[] = (json.candidates || []).flatMap((c: any) => {
          const grounding = c?.groundingMetadata?.groundingChunks || [];
          return grounding.map((chunk: any) => ({ uri: chunk.web?.uri, title: chunk.web?.title }));
        });

        // Build AgentResponse expected by the rest of the app
        return {
          company_data: { ...parsedResponse.company_data, last_updated: '' },
          agent_steps: parsedResponse.agent_steps || [],
          sources,
        } as AgentResponse;
      } catch (err) {
        // If the proxy or API fails, provide a mock response so the UI can
        // visualize a typical result locally. This keeps development fast.
        console.warn('Proxy failed, returning mock response for visualization:', err);
        const mock: AgentResponse = {
          company_data: {
            company_name: companyQuery,
            description: 'Mock description for local visualization.',
            sector: 'N/A',
            industry: 'N/A',
            founded_year: 'N/A',
            employees: 'N/A',
            revenue: 'N/A',
            net_income: 'N/A',
            cashflow: 'N/A',
            debt: 'N/A',
            growth_rate: 'N/A',
            headquarters: 'N/A',
            stock_data: { price: 'N/A', change: '0', change_percent: '0%', market_cap: 'N/A', chart_url: '' },
            financial_ratios: { pe_ratio: 'N/A', eps: 'N/A', roe: 'N/A' },
            revenue_trend: [],
            net_income_trend: [],
            cashflow_trend: [],
            last_updated: '',
          },
          agent_steps: ['Mock: no live data available'],
          sources: [],
        };
        return mock;
      }
    }

    // Server-side path: use SDK client (ai) which was initialized above.
    if (!ai) throw new Error('AI client not initialized on server');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: generatePrompt(companyQuery),
      config: {
        tools: [{ googleSearch: {} }],
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

    // Deconstruct company_data to check all fields for meaningful content,
    // excluding the company_name which is often just a reflection of the user's query.
    const {
      company_name,
      stock_data,
      financial_ratios,
      revenue_trend = [],
      net_income_trend = [],
      cashflow_trend = [],
      ...rest
    } = parsedResponse.company_data;

    const stockValues = stock_data ? Object.values(stock_data) : [];
    const ratioValues = financial_ratios ? Object.values(financial_ratios) : [];
    const trendValues = [...revenue_trend, ...net_income_trend, ...cashflow_trend].map(item => item.value);
    const allDataValues = [...Object.values(rest), ...stockValues, ...ratioValues, ...trendValues];

    // Check if the agent returned any data beyond just N/A values.
    const hasMeaningfulData = allDataValues.some(val => val && val !== 'N/A' && val !== 0 && val !== '');

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

export interface ChatOptions {
  isWebSearchEnabled: boolean;
  model?: 'gemini-2.5-flash' | 'gemini-2.5-pro';
}

export interface ChatResponse {
  text: string;
  sources?: Source[];
}

export const sendChatMessage = async (
  message: string,
  options: ChatOptions,
  companyContext?: string
): Promise<ChatResponse> => {
  try {
    // If we're in the browser, call the proxy endpoint
    if (isBrowser) {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          options: {
            isWebSearchEnabled: options.isWebSearchEnabled,
            model: options.model || 'gemini-2.5-flash'
          },
          companyContext
        }),
      });

      const json = await resp.json();
      if (!resp.ok || !json.ok) {
        throw new Error(json.error || `Chat API error (status ${resp.status})`);
      }

      return {
        text: json.text,
        sources: json.sources || []
      };
    }

    // Server-side path (for local development with Node)
    if (!ai) throw new Error('AI client not initialized on server');

    let content = message;
    if (companyContext) {
      content = `Given the context that I am looking at a company profile for "${companyContext}", answer the following question: ${message}`;
    }

    const systemInstructions: string[] = [
      "You are a helpful AI assistant specializing in business and financial topics. Your name is Profile Agent Assistant.",
      "Answer questions clearly and concisely.",
      "You can use Markdown for formatting your responses, such as using bolding with asterisks (*bold*) or bullet points with hyphens (-)."
    ];

    const model = options.model || 'gemini-2.5-flash';
    const config: any = {};
    let tools: any[] | undefined = undefined;

    if (options.isWebSearchEnabled) {
      tools = [{ googleSearch: {} }];
      systemInstructions.push("When asked for up-to-date information, news, or recent events, you MUST use the provided Google Search tool to find the most current and accurate answers. Base your responses on the search results.");
    }

    if (model === 'gemini-2.5-pro') {
      config.thinkingConfig = { thinkingBudget: 32768 };
      systemInstructions.push("You are now in Pro mode. Take your time to provide thorough, insightful, and well-reasoned answers, even for complex or abstract questions. Leverage your advanced reasoning capabilities.");
    }

    config.systemInstruction = systemInstructions.join('\n');

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

    const chatResponse: ChatResponse = { text };

    if (options.isWebSearchEnabled) {
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
      chatResponse.sources = sources;
    }

    return chatResponse;

  } catch (error) {
    console.error("Error sending chat message to Gemini:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to get a response from the assistant: ${error.message}`);
    }
    throw new Error("An unknown error occurred while chatting with the assistant.");
  }
};