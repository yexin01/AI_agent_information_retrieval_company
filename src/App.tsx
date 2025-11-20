import React, { useCallback, useEffect, useState } from 'react';
import { AgentSteps } from './components/AgentSteps';
import { Chatbot } from './components/Chatbot';
import { ChatbotToggleButton } from './components/ChatbotToggleButton';
import { CompanyProfile } from './components/CompanyProfile';
import { Dashboard } from './components/Dashboard';
import { LogoIcon } from './components/icons/LogoIcon';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { SearchBar } from './components/SearchBar';
import { ThemeToggle } from './components/ThemeToggle';
import { cn } from './lib/utils';
import * as db from './services/dbService';
import { fetchCompanyData } from './services/geminiService';
import { AgentResponse } from './types';

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  useEffect(() => {
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

      const animationDuration = data.agent_steps.length * 800 + 1000; // Slower animation for effect
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
      setView('dashboard');
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
    <div className="min-h-screen bg-slate-900 text-white font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        </div>
        <header className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center justify-center gap-4 mb-6 group cursor-pointer" onClick={handleBackToDashboard}>
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full group-hover:bg-cyan-500/40 transition-all duration-500" />
              <LogoIcon className="relative w-16 h-16 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
                Profile
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
                Agent
              </span>
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Advanced AI-powered corporate intelligence.
            <span className="block mt-1 text-sm text-slate-500">Powered by Gemini 2.5 Flash</span>
          </p>
        </header>

        <div className={cn(
          "sticky top-6 z-50 transition-all duration-500 ease-out",
          view !== 'dashboard' ? "max-w-2xl mx-auto" : "max-w-3xl mx-auto"
        )}>
          <div className="glass-panel rounded-2xl p-2 shadow-2xl shadow-black/50 ring-1 ring-white/10">
            <SearchBar onSearch={handleSearch} isLoading={isSearchActive} />
          </div>
        </div>

        <div className="mt-12 min-h-[400px]">
          {error && (
            <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/20 text-red-200 p-6 rounded-xl text-center animate-in zoom-in-95 duration-300 shadow-lg shadow-red-900/20">
              <p className="font-semibold text-lg mb-1">Unable to complete request</p>
              <p className="text-red-300/80">{error}</p>
            </div>
          )}

          {view === 'searching' && isLoading && (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
                <SpinnerIcon className="relative w-16 h-16 text-cyan-400 animate-spin" />
              </div>
              <p className="mt-8 text-cyan-200/70 font-medium tracking-wide animate-pulse">INITIALIZING AGENT...</p>
            </div>
          )}

          {view === 'searching' && isAnimatingSteps && (
            <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
              <AgentSteps steps={currentSteps} animateOnMount={true} />
            </div>
          )}

          {view === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <Dashboard companies={allCompanies} onSelectCompany={handleSelectCompany} />
            </div>
          )}

          {view === 'profile' && currentCompany && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CompanyProfile
                data={currentCompany}
                onRefresh={handleRefresh}
                onBack={handleBackToDashboard}
              />
            </div>
          )}

        </div>
      </main>

      {!isChatOpen && <ChatbotToggleButton onClick={() => setIsChatOpen(true)} />}
      <Chatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        companyContext={currentCompany?.company_data.company_name}
      />

      <footer className="relative z-10 text-center py-8 text-sm text-slate-600">
        <div className="flex items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
          <span>Built with Google Gemini</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span>v1.0.0</span>
        </div>
      </footer>
    </div>
  );
};

export default App;