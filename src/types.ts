export interface StockData {
  price: string;
  change: string;
  change_percent: string;
  market_cap: string;
  chart_url: string;
}

export interface FinancialRatios {
  pe_ratio: string;
  eps: string;
  roe: string;
}

export interface HistoricalDataPoint {
  year: number;
  value: string;
}

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
  stock_data: StockData;
  financial_ratios: FinancialRatios;
  revenue_trend: HistoricalDataPoint[];
  net_income_trend: HistoricalDataPoint[];
  cashflow_trend: HistoricalDataPoint[];
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