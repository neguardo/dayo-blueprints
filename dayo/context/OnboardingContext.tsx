import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

import type { ProductivityPeriod } from '../types/database';

export type PlanningStyle = 'automatic' | 'suggest' | 'manual';

export interface OnboardingData {
  obstacle: string | null;
  wakeTime: string;
  sleepTime: string;
  productivityPeriod: ProductivityPeriod;
  planningStyle: PlanningStyle | null;
  firstTask: string;
  estimatedMinutes: number;
  firstTaskId: string | null;
}

interface OnboardingContextValue {
  data: OnboardingData;
  update: (values: Partial<OnboardingData>) => void;
  reset: () => void;
}

const initialData: OnboardingData = {
  obstacle: null,
  wakeTime: '07:30',
  sleepTime: '23:30',
  productivityPeriod: 'morning',
  planningStyle: null,
  firstTask: '',
  estimatedMinutes: 45,
  firstTaskId: null,
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(initialData);
  const value = useMemo(
    () => ({
      data,
      update: (values: Partial<OnboardingData>) => setData((current) => ({ ...current, ...values })),
      reset: () => setData(initialData),
    }),
    [data],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const value = useContext(OnboardingContext);
  if (!value) throw new Error('useOnboarding must be used inside OnboardingProvider.');
  return value;
}
