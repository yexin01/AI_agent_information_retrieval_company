declare module '@google/genai' {
  export interface GenerateContentParams {
    model: string;
    contents: string | string[];
    config?: any;
    tools?: any;
  }

  export interface GroundingWeb {
    uri?: string;
    title?: string;
  }

  export interface GroundingChunk {
    web?: GroundingWeb;
  }

  export interface GroundingMetadata {
    groundingChunks?: GroundingChunk[];
  }

  export interface Candidate {
    groundingMetadata?: GroundingMetadata;
  }

  export interface GenerateContentResponse {
    text?: string;
    candidates?: Candidate[];
  }

  export class GoogleGenAI {
    constructor(options?: { apiKey?: string });
    models: {
      generateContent(params: GenerateContentParams): Promise<GenerateContentResponse>;
    };
  }

  export default GoogleGenAI;
}
