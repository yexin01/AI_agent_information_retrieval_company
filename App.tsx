import React, { useState, useCallback, useEffect } from 'react';
import { AgentResponse } from './types';
import { fetchCompanyData } from './services/geminiService';
import * as db from './services/dbService';
import { SearchBar } from './components/SearchBar';
import { CompanyProfile } from './components/CompanyProfile';
import { Dashboard } from './components/Dashboard';
import { AgentSteps } from './components/AgentSteps';
import { LogoIcon } from './components/icons/LogoIcon';
import { SpinnerIcon } from './components/icons/SpinnerIcon';

type View = 'dashboard' | 'searching' | 'profile';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [allCompanies, setAllCompanies] = useState<Record<string, AgentResponse>>({});
  const [currentCompany, setCurrentCompany] = useState<AgentResponse | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnimatingSteps, setIsAnimatingSteps] = useState<boolean>(false);
  const [currentSteps, setCurrentSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Carica tutte le aziende dal database locale all'avvio dell'app
    setAllCompanies(db.getAllCompanies());
  }, []);

  const handleSearch = useCallback(async (query: string, forceRefresh: boolean = false) => {
    if (!query) {
      setError("Please enter a company name.");
      return;
    }
    
    setError(null);
    setCurrentQuery(query);
    const queryKey = query.toLowerCase();

    if (!forceRefresh && allCompanies[queryKey]) {
      setCurrentCompany(allCompanies[queryKey]);
      setView('profile');
      return;
    }

    setIsLoading(true);
    setView('searching');
    setCurrentCompany(null);
    setCurrentSteps([]);
    setIsAnimatingSteps(false);

    try {
      const data = await fetchCompanyData(query);
      setIsLoading(false);
      setIsAnimatingSteps(true);
      setCurrentSteps(data.agent_steps);
      
      const animationDuration = data.agent_steps.length * 400 + 500;
      setTimeout(() => {
        const now = new Date();
        const updatedResponse: AgentResponse = {
          ...data,
          company_data: {
            ...data.company_data,
            last_updated: now.toISOString(),
          },
        };
        
        db.saveCompany(queryKey, updatedResponse);
        setAllCompanies(prev => ({ ...prev, [queryKey]: updatedResponse }));
        setCurrentCompany(updatedResponse);
        setView('profile');
        setIsAnimatingSteps(false);
      }, animationDuration);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setView('dashboard'); // Torna alla dashboard in caso di errore
      setIsLoading(false);
      setIsAnimatingSteps(false);
    }
  }, [allCompanies]);

  const handleRefresh = useCallback(() => {
    if (currentQuery) {
      handleSearch(currentQuery, true);
    }
  }, [currentQuery, handleSearch]);

  const handleSelectCompany = (company: AgentResponse) => {
    setCurrentCompany(company);
    setCurrentQuery(company.company_data.company_name);
    setView('profile');
  };
  
  const handleBackToDashboard = () => {
    setCurrentCompany(null);
    setError(null);
    setView('dashboard');
  };
  
  const isSearchActive = isLoading || isAnimatingSteps;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <LogoIcon className="w-12 h-12 text-cyan-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">
              AI Company Profile Agent
            </h1>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Search for public company information or view your saved dashboard.
          </p>
        </header>

        <div className="sticky top-4 z-10 bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-700">
          <SearchBar onSearch={handleSearch} isLoading={isSearchActive} />
        </div>

        <div className="mt-8">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center animate-fade-in mb-4">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {view === 'searching' && isLoading && (
            <div className="text-center py-16">
              <SpinnerIcon className="w-10 h-10 mx-auto animate-spin text-cyan-400" />
            </div>
          )}
          
          {view === 'searching' && isAnimatingSteps && (
             <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl shadow-2xl animate-fade-in">
              <AgentSteps steps={currentSteps} animateOnMount={true} />
            </div>
          )}

          {view === 'dashboard' && (
            <Dashboard companies={allCompanies} onSelectCompany={handleSelectCompany} />
          )}

          {view === 'profile' && currentCompany && (
            <CompanyProfile 
              data={currentCompany} 
              onRefresh={handleRefresh}
              onBack={handleBackToDashboard}
            />
          )}

        </div>
      </main>
      <footer className="text-center py-4 text-xs text-slate-600">
        Powered by Google Gemini
      </footer>
    </div>
  );
};

export default App;
