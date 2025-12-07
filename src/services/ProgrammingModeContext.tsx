import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type CommandCenterTab = 'command' | 'preview' | 'history' | 'diagnostics' | 'files';

interface ProgrammingModeContextType {
  isProgrammingMode: boolean;
  toggleProgrammingMode: () => void;
  enableProgrammingMode: () => void;
  disableProgrammingMode: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isCommandCenterOpen: boolean;
  openCommandCenter: (tab?: CommandCenterTab, autoRunDiagnostics?: boolean) => void;
  closeCommandCenter: () => void;
  toggleCommandCenter: () => void;
  initialTab: CommandCenterTab;
  shouldAutoRunDiagnostics: boolean;
  clearAutoRunDiagnostics: () => void;
}

const ProgrammingModeContext = createContext<ProgrammingModeContextType | undefined>(undefined);

const STORAGE_KEY = 'sini_car_programming_mode';

export function ProgrammingModeProvider({ children }: { children: ReactNode }) {
  const [isProgrammingMode, setIsProgrammingMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'true';
  });
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<CommandCenterTab>('command');
  const [shouldAutoRunDiagnostics, setShouldAutoRunDiagnostics] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isProgrammingMode));
  }, [isProgrammingMode]);

  const toggleProgrammingMode = () => {
    setIsProgrammingMode(prev => {
      if (prev) {
        setIsCommandCenterOpen(false);
      }
      return !prev;
    });
  };
  const enableProgrammingMode = () => setIsProgrammingMode(true);
  const disableProgrammingMode = () => {
    setIsCommandCenterOpen(false);
    setIsProgrammingMode(false);
  };
  const openCommandCenter = (tab?: CommandCenterTab, autoRunDiagnostics?: boolean) => {
    setInitialTab(tab || 'command');
    setShouldAutoRunDiagnostics(autoRunDiagnostics || false);
    setIsCommandCenterOpen(true);
  };
  const closeCommandCenter = () => setIsCommandCenterOpen(false);
  const toggleCommandCenter = () => setIsCommandCenterOpen(prev => !prev);
  const clearAutoRunDiagnostics = () => setShouldAutoRunDiagnostics(false);

  return (
    <ProgrammingModeContext.Provider value={{
      isProgrammingMode,
      toggleProgrammingMode,
      enableProgrammingMode,
      disableProgrammingMode,
      currentPage,
      setCurrentPage,
      isCommandCenterOpen,
      openCommandCenter,
      closeCommandCenter,
      toggleCommandCenter,
      initialTab,
      shouldAutoRunDiagnostics,
      clearAutoRunDiagnostics
    }}>
      {children}
    </ProgrammingModeContext.Provider>
  );
}

export function useProgrammingMode() {
  const context = useContext(ProgrammingModeContext);
  if (!context) {
    throw new Error('useProgrammingMode must be used within ProgrammingModeProvider');
  }
  return context;
}
