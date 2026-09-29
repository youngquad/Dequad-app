import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

export type AccessSource = 'premium' | 'university' | 'free';

interface Entitlements {
  loading: boolean;
  hasFullAccess: boolean;
  accessSource: AccessSource;
  isPaidPremium: boolean;
  licenceUniversity: string | null;
  lockedFeatures: string[];
  refresh: () => Promise<void>;
}

const EntitlementsContext = createContext<Entitlements>({
  loading: true,
  hasFullAccess: false,
  accessSource: 'free',
  isPaidPremium: false,
  licenceUniversity: null,
  lockedFeatures: [],
  refresh: async () => {},
});

export const EntitlementsProvider = ({ children }: { children: React.ReactNode }) => {
  const { sessionToken, user } = useAuth();
  const [state, setState] = useState({
    loading: true,
    hasFullAccess: false,
    accessSource: 'free' as AccessSource,
    isPaidPremium: false,
    licenceUniversity: null as string | null,
    lockedFeatures: [] as string[],
  });

  const refresh = useCallback(async () => {
    if (!sessionToken || !user || user.role !== 'student') {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    try {
      const d = await api.get('/subscription/status', sessionToken);
      setState({
        loading: false,
        hasFullAccess: !!d.has_full_access,
        accessSource: (d.access_source || 'free') as AccessSource,
        isPaidPremium: !!d.is_paid_premium,
        licenceUniversity: d.licence_university || null,
        lockedFeatures: d.locked_features || [],
      });
    } catch (e) {
      console.error('Entitlements refresh failed:', e);
      setState((s) => ({ ...s, loading: false }));
    }
  }, [sessionToken, user?.user_id, user?.role, user?.plan]);

  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') refresh(); });
    return () => sub.remove();
  }, [refresh]);

  const value = useMemo(() => ({ ...state, refresh }), [state, refresh]);
  return <EntitlementsContext.Provider value={value}>{children}</EntitlementsContext.Provider>;
};

export const useEntitlements = () => useContext(EntitlementsContext);
