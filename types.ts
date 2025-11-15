export interface CompanyData {
  company_name: string;
  description: string;
  sector: string;
  industry: string;
  founded_year: number | string;
  employees: number | string;
  revenue: string;
  net_income: string;
  debt: string;
  growth_rate: string;
  cashflow: string;
  headquarters: string;
  last_updated: string;
}

export interface Source {
  uri: string;
  title: string;
}

export interface AgentResponse {
  company_data: CompanyData;
  agent_steps: string[];
  sources: Source[];
}