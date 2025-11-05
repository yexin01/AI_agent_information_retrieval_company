import React from 'react';
import { AgentResponse } from '../types';
import { MetricCard } from './MetricCard';
import { AgentSteps } from './AgentSteps';
import { SourceList } from './SourceList';
import { RefreshIcon } from './icons/RefreshIcon';
import { BuildingIcon } from './icons/BuildingIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { UsersIcon } from './icons/UsersIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CashIcon } from './icons/CashIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { BanknotesIcon } from './icons/BanknotesIcon';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';

interface CompanyProfileProps {
  data: AgentResponse;
  onRefresh: () => void;
  lastUpdated: Date | null;
}

export const CompanyProfile: React.FC<CompanyProfileProps> = ({ data, onRefresh, lastUpdated }) => {
  const { company_data, agent_steps, sources } = data;

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
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl shadow-2xl animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <BuildingIcon className="w-8 h-8 text-cyan-400" />
            {company_data.company_name}
          </h2>
          <p className="text-slate-400 mt-1">
            Last updated: {timeAgo(lastUpdated)}
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-200"
        >
          <RefreshIcon className="w-5 h-5" />
          <span>Refresh Data</span>
        </button>
      </div>

      <AgentSteps steps={agent_steps} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard icon={<CalendarIcon/>} title="Founded" value={formatValue(company_data.founded_year)} />
        <MetricCard icon={<GlobeIcon/>} title="Headquarters" value={formatValue(company_data.headquarters)} />
        <MetricCard icon={<UsersIcon/>} title="Employees" value={formatValue(company_data.employees)} />
        <MetricCard icon={<ChartBarIcon/>} title="Revenue" value={formatValue(company_data.revenue)} />
        <MetricCard icon={<CashIcon/>} title="Net Income" value={formatValue(company_data.net_income)} />
        <MetricCard icon={<TrendingUpIcon/>} title="Growth Rate (YoY)" value={formatValue(company_data.growth_rate)} />
        <MetricCard icon={<BanknotesIcon/>} title="Cash Flow" value={formatValue(company_data.cashflow)} />
        <MetricCard icon={<ExclamationCircleIcon/>} title="Total Debt" value={formatValue(company_data.debt)} />
      </div>
      
      <SourceList sources={sources} />
    </div>
  );
};