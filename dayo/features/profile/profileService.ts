import { supabase } from '../../lib/supabase';
import type { Profile, ProductivityPeriod } from '../../types/database';

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}

export async function completeOnboarding(input: {
  wakeTime: string;
  sleepTime: string;
  productivityPeriod: ProductivityPeriod;
}): Promise<void> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error('You must be logged in.');

  const { error } = await supabase
    .from('profiles')
    .update({
      wake_time: input.wakeTime,
      sleep_time: input.sleepTime,
      productivity_period: input.productivityPeriod,
      onboarding_completed: true,
    })
    .eq('id', authData.user.id);

  if (error) throw error;
}
