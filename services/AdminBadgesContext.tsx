import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { MockApi } from './mockApi';

interface AdminBadgeCounts {
  accounts: number;
  quotes: number;
  imports: number;
  missing: number;
}

interface AdminBadgesContextType {
  badges: AdminBadgeCounts;
  refreshBadges: () => void;
  markAccountsAsSeen: () => void;
  markQuotesAsSeen: () => void;
  markImportsAsSeen: () => void;
  markMissingAsSeen: () => void;
}

const AdminBadgesContext = createContext<AdminBadgesContextType | null>(null);

export function AdminBadgesProvider({ children }: { children: ReactNode }) {
  const [badges, setBadges] = useState<AdminBadgeCounts>({
    accounts: 0,
    quotes: 0,
    imports: 0,
    missing: 0
  });

  const refreshBadges = useCallback(() => {
    const counts = MockApi.getNewItemCounts();
    setBadges(counts);
  }, []);

  const markAccountsAsSeen = useCallback(() => {
    MockApi.markAccountRequestsAsSeen();
    setBadges(prev => ({ ...prev, accounts: 0 }));
  }, []);

  const markQuotesAsSeen = useCallback(() => {
    MockApi.markQuoteRequestsAsSeen();
    setBadges(prev => ({ ...prev, quotes: 0 }));
  }, []);

  const markImportsAsSeen = useCallback(() => {
    MockApi.markImportRequestsAsSeen();
    setBadges(prev => ({ ...prev, imports: 0 }));
  }, []);

  const markMissingAsSeen = useCallback(() => {
    MockApi.markMissingRequestsAsSeen();
    setBadges(prev => ({ ...prev, missing: 0 }));
  }, []);

  useEffect(() => {
    refreshBadges();
    
    const interval = setInterval(refreshBadges, 30000);
    return () => clearInterval(interval);
  }, [refreshBadges]);

  return (
    <AdminBadgesContext.Provider value={{
      badges,
      refreshBadges,
      markAccountsAsSeen,
      markQuotesAsSeen,
      markImportsAsSeen,
      markMissingAsSeen
    }}>
      {children}
    </AdminBadgesContext.Provider>
  );
}

export function useAdminBadges() {
  const context = useContext(AdminBadgesContext);
  if (!context) {
    throw new Error('useAdminBadges must be used within an AdminBadgesProvider');
  }
  return context;
}
