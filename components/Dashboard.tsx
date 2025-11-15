import React from 'react';
import { AgentResponse } from '../types';
import { BuildingIcon } from './icons/BuildingIcon';

interface DashboardProps {
  companies: Record<string, AgentResponse>;
  onSelectCompany: (company: AgentResponse) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ companies, onSelectCompany }) => {
  // Fix: Explicitly type companyList to ensure correct type inference for its elements.
  const companyList: AgentResponse[] = Object.values(companies);

  if (companyList.length === 0) {
    return (
      <div className="text-center text-slate-500 mt-16 animate-fade-in">
        <div className="flex items-center justify-center gap-4 mb-4 text-slate-600">
            <BuildingIcon className="w-16 h-16" />
        </div>
        <p className="text-xl">Your dashboard is empty.</p>
        <p className="text-slate-400">Search for a company to add it here.</p>
        <p className="text-sm mt-2">Example: "Tesla", "Microsoft", "Alphabet Inc."</p>
      </div>
    );
  }
  
  // Sort companies by most recently updated
  companyList.sort((a, b) => 
    new Date(b.company_data.last_updated).getTime() - new Date(a.company_data.last_updated).getTime()
  );

  return (
    <div className="bg-slate-800/50 border border-slate-700 p-4 sm:p-6 rounded-xl shadow-2xl animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-4">Companies Dashboard</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-slate-600 text-sm text-slate-400">
            <tr>
              <th className="p-3">Company</th>
              <th className="p-3 hidden md:table-cell">Revenue</th>
              <th className="p-3 hidden sm:table-cell">Headquarters</th>
              <th className="p-3">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {companyList.map(company => (
              <tr 
                key={company.company_data.company_name} 
                className="border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 cursor-pointer transition-colors duration-200"
                onClick={() => onSelectCompany(company)}
              >
                <td className="p-3 font-semibold text-cyan-400">{company.company_data.company_name}</td>
                <td className="p-3 hidden md:table-cell">{company.company_data.revenue}</td>
                <td className="p-3 hidden sm:table-cell truncate max-w-xs">{company.company_data.headquarters}</td>
                <td className="p-3 text-sm text-slate-400">{new Date(company.company_data.last_updated).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
