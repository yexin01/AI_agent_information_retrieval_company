import React from 'react';
import { AgentResponse } from '../types';
import { AgentSteps } from './AgentSteps';
import { FinancialChart } from './FinancialChart';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ArrowTrendingUpIcon } from './icons/ArrowTrendingUpIcon';
import { BanknotesIcon } from './icons/BanknotesIcon';
import { BuildingIcon } from './icons/BuildingIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { CashIcon } from './icons/CashIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ChartBarSquareIcon } from './icons/ChartBarSquareIcon';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { ReceiptPercentIcon } from './icons/ReceiptPercentIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { ScaleIcon } from './icons/ScaleIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { UsersIcon } from './icons/UsersIcon';
import { MetricCard } from './MetricCard';
import { SourceList } from './SourceList';
import { StockTicker } from './StockTicker';

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header Section */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center border border-white/10 shadow-lg shadow-cyan-900/20">
                <BuildingIcon className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-white tracking-tight">
                  {company_data.company_name}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-slate-400 flex items-center gap-1">
                    <RefreshIcon className="w-3 h-3" />
                    Updated {timeAgo(lastUpdatedDate)}
                  </span>
                  {company_data.sector && company_data.sector !== 'N/A' && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {company_data.sector}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={onRefresh}
              className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm font-medium flex items-center gap-2 border border-cyan-500/20"
            >
              <RefreshIcon className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {company_data.description && company_data.description !== 'N/A' && (
          <div className="mt-8 p-6 bg-slate-900/50 rounded-xl border border-white/5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <InformationCircleIcon className="w-4 h-4" />
              About
            </h3>
            <p className="text-slate-300 leading-relaxed text-lg">
              {company_data.description}
            </p>
          </div>
        )}
      </div>

      {hasStockData && <StockTicker data={company_data.stock_data} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Key Metrics Grid */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-cyan-400" />
              Key Metrics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricCard icon={<ChartBarIcon />} title="Revenue" value={formatValue(company_data.revenue)} delay={0} />
              <MetricCard icon={<CashIcon />} title="Net Income" value={formatValue(company_data.net_income)} delay={1} />
              <MetricCard icon={<TrendingUpIcon />} title="Growth Rate" value={formatValue(company_data.growth_rate)} delay={2} />
              <MetricCard icon={<BanknotesIcon />} title="Cash Flow" value={formatValue(company_data.cashflow)} delay={3} />
              <MetricCard icon={<UsersIcon />} title="Employees" value={formatValue(company_data.employees)} delay={4} />
              <MetricCard icon={<GlobeIcon />} title="Headquarters" value={formatValue(company_data.headquarters)} delay={5} />
            </div>
          </div>

          {hasTrendData && (
            <div className="glass-panel rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <ChartBarSquareIcon className="w-5 h-5 text-violet-400" />
                Financial Trends (5-Year)
              </h3>
              <FinancialChart data={{
                revenue: company_data.revenue_trend,
                netIncome: company_data.net_income_trend,
                cashflow: company_data.cashflow_trend,
              }} />
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Side Panel */}
          {hasFinancialRatios && (
            <div className="glass-panel rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Financial Ratios</h3>
              <div className="space-y-4">
                <MetricCard icon={<ScaleIcon />} title="P/E Ratio" value={formatValue(company_data.financial_ratios?.pe_ratio)} compact />
                <MetricCard icon={<ReceiptPercentIcon />} title="EPS" value={formatValue(company_data.financial_ratios?.eps)} compact />
                <MetricCard icon={<ArrowTrendingUpIcon />} title="ROE" value={formatValue(company_data.financial_ratios?.roe)} compact />
              </div>
            </div>
          )}

          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
            <div className="space-y-4">
              <MetricCard icon={<CalendarIcon />} title="Founded" value={formatValue(company_data.founded_year)} compact />
              <MetricCard icon={<ExclamationCircleIcon />} title="Total Debt" value={formatValue(company_data.debt)} compact />
            </div>
          </div>

          <SourceList sources={sources} />
        </div>
      </div>

      <div className="pt-8 border-t border-white/10">
        <AgentSteps steps={agent_steps} animateOnMount={false} />
      </div>
    </div>
  );
};