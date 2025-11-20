import { AgentResponse } from '../types';

const DB_KEY = 'ai_company_agent_db';

/**
 * Retrieves all saved company data from localStorage.
 * @returns A record object where keys are lowercase company queries and values are AgentResponse data.
 */
export const getAllCompanies = (): Record<string, AgentResponse> => {
  try {
    const rawData = localStorage.getItem(DB_KEY);
    if (!rawData) return {};
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Failed to parse company data from localStorage", error);
    // In case of parsing error, return an empty object to prevent app crash
    return {};
  }
};

/**
 * Saves or updates a single company's data in localStorage.
 * @param query The lowercase search query for the company.
 * @param data The AgentResponse data to save.
 */
export const saveCompany = (query: string, data: AgentResponse): void => {
  try {
    const allCompanies = getAllCompanies();
    allCompanies[query.toLowerCase()] = data;
    localStorage.setItem(DB_KEY, JSON.stringify(allCompanies));
  } catch (error) {
    console.error("Failed to save company data to localStorage", error);
  }
};
