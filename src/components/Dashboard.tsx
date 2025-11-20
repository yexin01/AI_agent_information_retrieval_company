import React from 'react';
import { AgentResponse } from '../types';
import { BuildingIcon } from './icons/BuildingIcon';

interface DashboardProps {
  companies: Record<string, AgentResponse>;
  onSelectCompany: (company: AgentResponse) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ companies, onSelectCompany }) => {
  const companyList: AgentResponse[] = Object.values(companies);

  if (companyList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
          <BuildingIcon className="relative w-20 h-20 text-slate-600" />
        </div>
        <h3 className="text-2xl font-semibold text-slate-300 mb-2">Your dashboard is empty</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Search for a company above to generate a comprehensive AI profile and add it to your collection.
        </p>
      </div>
    );
  }

  companyList.sort((a, b) =>
    new Date(b.company_data.last_updated).getTime() - new Date(a.company_data.last_updated).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white tracking-tight">Recent Profiles</h2>
        <span className="text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-white/5">
          {companyList.length} {companyList.length === 1 ? 'Company' : 'Companies'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companyList.map(company => (
          <div
            key={company.company_data.company_name}
            onClick={() => onSelectCompany(company)}
            className="group relative cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full glass-card rounded-2xl p-6 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 group-hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl font-bold text-cyan-400">
                    {company.company_data.company_name.charAt(0)}
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-slate-900/50 px-2 py-1 rounded-lg border border-white/5">
                  {new Date(company.company_data.last_updated).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                {company.company_data.company_name}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Revenue</span>
                  <span className="text-slate-300 font-medium">{company.company_data.revenue}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">HQ</span>
                  <span className="text-slate-300 truncate max-w-[120px]">{company.company_data.headquarters}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center text-cyan-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                View Profile →
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
