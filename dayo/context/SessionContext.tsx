import type { Session } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getCurrentProfile } from '../features/profile/profileService';
import { supabase } from '../lib/supabase';

interface SessionContextValue {
  session: Session | null;
  loading: boolean;
  onboardingCompleted: boolean;
  refreshProfile: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const loadProfile = useCallback(async (activeSession: Session | null) => {
    if (!activeSession) {
      setOnboardingCompleted(false);
      return;
    }

    const profile = await getCurrentProfile();
    setOnboardingCompleted(profile?.onboarding_completed ?? false);
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile(session);
  }, [loadProfile, session]);

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getSession().then(async ({ data, error }) => {
      if (!mounted) return;
      if (error) console.warn('Session restore failed:', error.message);
      setSession(data.session);
      try {
        await loadProfile(data.session);
      } catch (profileError) {
        console.warn('Profile load failed:', profileError);
      } finally {
        if (mounted) setLoading(false);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setLoading(true);
      void loadProfile(nextSession)
        .catch((profileError: unknown) => console.warn('Profile load failed:', profileError))
        .finally(() => {
          if (mounted) setLoading(false);
        });
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value = useMemo(
    () => ({ session, loading, onboardingCompleted, refreshProfile }),
    [session, loading, onboardingCompleted, refreshProfile],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside SessionProvider.');
  return value;
}
