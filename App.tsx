import React, { useState, useCallback } from 'react';
import { AgentResponse } from './types';
import { fetchCompanyData } from './services/geminiService';
import { SearchBar } from './components/SearchBar';
import { CompanyProfile } from './components/CompanyProfile';
import { AgentSteps } from './components/AgentSteps';
import { LogoIcon } from './components/icons/LogoIcon';
import { SpinnerIcon } from './components/icons/SpinnerIcon';


const App: React.FC = () => {
  const [companyQuery, setCompanyQuery] = useState<string>('');
  const [agentResponse, setAgentResponse] = useState<AgentResponse | null>(null);
  const [cachedData, setCachedData] = useState<Record<string, AgentResponse>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnimatingSteps, setIsAnimatingSteps] = useState<boolean>(false);
  const [currentSteps, setCurrentSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleSearch = useCallback(async (query: string, forceRefresh: boolean = false) => {
    if (!query) {
      setError("Please enter a company name.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setAgentResponse(null);
    setCurrentSteps([]);
    setIsAnimatingSteps(false);
    setCompanyQuery(query);

    if (!forceRefresh && cachedData[query.toLowerCase()]) {
      const cachedResponse = cachedData[query.toLowerCase()];
      setAgentResponse(cachedResponse);
       // In a real app, the lastUpdated date would be stored with the cache.
       // For this demo, we'll just show the date it was loaded from cache.
      setLastUpdated(new Date()); 
      setIsLoading(false);
      return;
    }

    try {
      const data = await fetchCompanyData(query);
      setIsLoading(false);
      setIsAnimatingSteps(true);
      setCurrentSteps(data.agent_steps);
      
      const animationDuration = data.agent_steps.length * 400 + 500; // 400ms per step + 500ms buffer
      setTimeout(() => {
        const now = new Date();
        const updatedResponse: AgentResponse = {
          ...data,
          company_data: {
            ...data.company_data,
            last_updated: now.toISOString().split('T')[0],
          },
        };
        
        setAgentResponse(updatedResponse);
        setCachedData(prevCache => ({ ...prevCache, [query.toLowerCase()]: updatedResponse }));
        setLastUpdated(now);
        setIsAnimatingSteps(false);
      }, animationDuration);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setAgentResponse(null);
      setIsLoading(false);
      setIsAnimatingSteps(false);
    }
  }, [cachedData]);

  const handleRefresh = useCallback(() => {
    if (companyQuery) {
      handleSearch(companyQuery, true);
    }
  }, [companyQuery, handleSearch]);

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
            Enter a company name to get its financial and structural information, retrieved and structured by Gemini.
          </p>
        </header>

        <div className="sticky top-4 z-10 bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-700">
          <SearchBar onSearch={handleSearch} isLoading={isLoading || isAnimatingSteps} />
        </div>

        <div className="mt-8">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center animate-fade-in">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {isLoading && (
            <div className="text-center py-16">
              <SpinnerIcon className="w-10 h-10 mx-auto animate-spin text-cyan-400" />
            </div>
          )}
          
          {isAnimatingSteps && !agentResponse && (
             <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl shadow-2xl animate-fade-in">
              <AgentSteps steps={currentSteps} />
            </div>
          )}

          {!isAnimatingSteps && agentResponse && (
            <CompanyProfile 
              data={agentResponse} 
              onRefresh={handleRefresh}
              lastUpdated={lastUpdated}
            />
          )}

          {!isLoading && !isAnimatingSteps && !agentResponse && !error && (
            <div className="text-center text-slate-500 mt-16">
              <p>Search for a company to begin.</p>
              <p className="text-sm">Example: "Tesla", "Microsoft", "Alphabet Inc."</p>
            </div>
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