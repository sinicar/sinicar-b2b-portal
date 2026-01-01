import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Api } from './api';

interface AdminBadgeCounts {
  orders: number;
  accounts: number;
  quotes: number;
  imports: number;
  missing: number;
  orderShortages: number;
}

interface AdminBadgesContextType {
  badges: AdminBadgeCounts;
  refreshBadges: () => void;
  markOrdersAsSeen: () => void;
  markAccountsAsSeen: () => void;
  markQuotesAsSeen: () => void;
  markImportsAsSeen: () => void;
  markMissingAsSeen: () => void;
  markOrderShortagesAsSeen: () => void;
}

const AdminBadgesContext = createContext<AdminBadgesContextType | null>(null);

export function AdminBadgesProvider({ children }: { children: ReactNode }) {
  const [badges, setBadges] = useState<AdminBadgeCounts>({
    orders: 0,
    accounts: 0,
    quotes: 0,
    imports: 0,
    missing: 0,
    orderShortages: 0
  });

  const refreshBadges = useCallback(async () => {
    try {
      // Try to get counts from real API, fallback to zeros
      const counts = (Api as any).getNewItemCounts ? (Api as any).getNewItemCounts() : { orders: 0, accounts: 0, quotes: 0, imports: 0, missing: 0 };
      const stats = (Api as any).getOrderShortagesStats ? await (Api as any).getOrderShortagesStats() : { new: 0 };
      setBadges({ ...counts, orderShortages: stats.new });
    } catch (error) {
      console.warn('Failed to refresh badges:', error);
      // Keep current badges on error
    }
  }, []);

  const markOrdersAsSeen = useCallback(() => {
    if ((Api as any).markOrdersAsSeen) (Api as any).markOrdersAsSeen();
    setBadges(prev => ({ ...prev, orders: 0 }));
  }, []);

  const markAccountsAsSeen = useCallback(() => {
    if ((Api as any).markAccountRequestsAsSeen) (Api as any).markAccountRequestsAsSeen();
    setBadges(prev => ({ ...prev, accounts: 0 }));
  }, []);

  const markQuotesAsSeen = useCallback(() => {
    if ((Api as any).markQuoteRequestsAsSeen) (Api as any).markQuoteRequestsAsSeen();
    setBadges(prev => ({ ...prev, quotes: 0 }));
  }, []);

  const markImportsAsSeen = useCallback(() => {
    if ((Api as any).markImportRequestsAsSeen) (Api as any).markImportRequestsAsSeen();
    setBadges(prev => ({ ...prev, imports: 0 }));
  }, []);

  const markMissingAsSeen = useCallback(() => {
    if ((Api as any).markMissingRequestsAsSeen) (Api as any).markMissingRequestsAsSeen();
    setBadges(prev => ({ ...prev, missing: 0 }));
  }, []);

  const markOrderShortagesAsSeen = useCallback(async () => {
    if ((Api as any).markOrderShortagesAsSeen) await (Api as any).markOrderShortagesAsSeen();
    setBadges(prev => ({ ...prev, orderShortages: 0 }));
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
      markOrdersAsSeen,
      markAccountsAsSeen,
      markQuotesAsSeen,
      markImportsAsSeen,
      markMissingAsSeen,
      markOrderShortagesAsSeen
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
