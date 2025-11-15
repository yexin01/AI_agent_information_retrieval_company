import React from 'react';
import { AgentResponse } from '../types';
import { MetricCard } from './MetricCard';
import { AgentSteps } from './AgentSteps';
import { SourceList } from './SourceList';
import { StockTicker } from './StockTicker';
import { FinancialChart } from './FinancialChart';
import { RefreshIcon } from './icons/RefreshIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { BuildingIcon } from './icons/BuildingIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { UsersIcon } from './icons/UsersIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CashIcon } from './icons/CashIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { BanknotesIcon } from './icons/BanknotesIcon';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';
import { TagIcon } from './icons/TagIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { ScaleIcon } from './icons/ScaleIcon';
import { ReceiptPercentIcon } from './icons/ReceiptPercentIcon';
import { ArrowTrendingUpIcon } from './icons/ArrowTrendingUpIcon';
import { ChartBarSquareIcon } from './icons/ChartBarSquareIcon';

interface CompanyProfileProps {
  data: AgentResponse;
  onRefresh: () => void;
  onBack: () => void;
}

export const CompanyProfile: React.FC<CompanyProfileProps> = ({ data, onRefresh, onBack }) => {
  const { company_data, agent_steps, sources } = data;
  const lastUpdatedDate = company_data.last_updated ? new Date(company_data.last_updated) : null;

  const formatValue = (value: number | string | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  const timeAgo = (date: Date | null): string => {
    if (!date) return 'just now';
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} year${Math.floor(interval) > 1 ? 's' : ''} ago`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} month${Math.floor(interval) > 1 ? 's' : ''} ago`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} day${Math.floor(interval) > 1 ? 's' : ''} ago`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} hour${Math.floor(interval) > 1 ? 's' : ''} ago`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minute${Math.floor(interval) > 1 ? 's' : ''} ago`;
    return "just now";
  }

  const hasStockData = company_data.stock_data && company_data.stock_data.price !== 'N/A';
  const hasFinancialRatios = company_data.financial_ratios && 
    (company_data.financial_ratios.pe_ratio !== 'N/A' ||
     company_data.financial_ratios.eps !== 'N/A' ||
     company_data.financial_ratios.roe !== 'N/A');
  
  const hasTrendData = company_data.revenue_trend?.some(d => d.value !== 'N/A') ||
                     company_data.net_income_trend?.some(d => d.value !== 'N/A') ||
                     company_data.cashflow_trend?.some(d => d.value !== 'N/A');

  return (
    <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl shadow-2xl animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-200"
        >
          <RefreshIcon className="w-5 h-5" />
          <span>Refresh Data</span>
        </button>
      </div>
      
      <div className="border-b border-slate-700 pb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <BuildingIcon className="w-8 h-8 text-cyan-400" />
          {company_data.company_name}
        </h2>
        <p className="text-slate-400 mt-1">
          Last updated: {timeAgo(lastUpdatedDate)}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-4">
            {company_data.sector && company_data.sector !== 'N/A' && (
              <div className="flex items-center gap-1.5 bg-cyan-900/50 text-cyan-300 text-xs font-medium px-2.5 py-1 rounded-full border border-cyan-800">
                <TagIcon className="w-4 h-4" />
                <span>{company_data.sector}</span>
              </div>
            )}
            {company_data.industry && company_data.industry !== 'N/A' && (
              <div className="flex items-center gap-1.5 bg-violet-900/50 text-violet-300 text-xs font-medium px-2.5 py-1 rounded-full border border-violet-800">
                <TagIcon className="w-4 h-4" />
                <span>{company_data.industry}</span>
              </div>
            )}
        </div>
      </div>

      {company_data.description && company_data.description !== 'N/A' && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <InformationCircleIcon className="w-5 h-5 text-slate-400" />
            About {company_data.company_name}
          </h3>
          <p className="text-slate-400 leading-relaxed">{company_data.description}</p>
        </div>
      )}

      {hasStockData && <StockTicker data={company_data.stock_data} />}

      <AgentSteps steps={agent_steps} animateOnMount={false} />
      
      {hasTrendData && (
        <div>
           <h3 className="text-lg font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <ChartBarSquareIcon className="w-5 h-5 text-slate-400" />
              Financial Trends (5-Year History)
            </h3>
            <FinancialChart data={{
              revenue: company_data.revenue_trend,
              netIncome: company_data.net_income_trend,
              cashflow: company_data.cashflow_trend,
            }} />
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-slate-300 mb-3">Key Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <MetricCard icon={<CalendarIcon/>} title="Founded" value={formatValue(company_data.founded_year)} />
          <MetricCard icon={<GlobeIcon/>} title="Headquarters" value={formatValue(company_data.headquarters)} />
          <MetricCard icon={<UsersIcon/>} title="Employees" value={formatValue(company_data.employees)} />
          <MetricCard icon={<ChartBarIcon/>} title="Revenue" value={formatValue(company_data.revenue)} />
          <MetricCard icon={<CashIcon/>} title="Net Income" value={formatValue(company_data.net_income)} />
          <MetricCard icon={<TrendingUpIcon/>} title="Growth Rate (YoY)" value={formatValue(company_data.growth_rate)} />
          <MetricCard icon={<BanknotesIcon/>} title="Cash Flow" value={formatValue(company_data.cashflow)} />
          <MetricCard icon={<ExclamationCircleIcon/>} title="Total Debt" value={formatValue(company_data.debt)} />
        </div>
      </div>
      
      {hasFinancialRatios && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-3 mt-6">Financial Ratios</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard icon={<ScaleIcon/>} title="P/E Ratio" value={formatValue(company_data.financial_ratios?.pe_ratio)} />
              <MetricCard icon={<ReceiptPercentIcon/>} title="EPS" value={formatValue(company_data.financial_ratios?.eps)} />
              <MetricCard icon={<ArrowTrendingUpIcon/>} title="Return on Equity (ROE)" value={formatValue(company_data.financial_ratios?.roe)} />
          </div>
        </div>
      )}
      
      <SourceList sources={sources} />
    </div>
  );
};