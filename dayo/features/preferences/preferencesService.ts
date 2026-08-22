import { supabase } from '../../lib/supabase';
import type { PlanningBehavior, UserPreferences } from '../../types/database';

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('You must be logged in.');
  return data.user.id;
}

export async function getUserPreferences(): Promise<UserPreferences> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data as UserPreferences;
}

export async function updatePlanningBehavior(
  planningBehavior: PlanningBehavior,
): Promise<UserPreferences> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('user_preferences')
    .update({ planning_behavior: planningBehavior })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as UserPreferences;
}

export async function updateUserPreferences(
  updates: Partial<Pick<UserPreferences,
    | 'max_focus_minutes'
    | 'break_minutes'
    | 'minimum_free_minutes_per_day'
    | 'preferred_focus_period'
    | 'notifications_enabled'
    | 'auto_reschedule_enabled'
    | 'planning_behavior'>>,
): Promise<UserPreferences> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('user_preferences')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as UserPreferences;
}
