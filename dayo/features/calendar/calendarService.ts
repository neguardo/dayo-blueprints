import { supabase } from '../../lib/supabase';
import type { CalendarEvent, CreateCalendarEventInput } from '../../types/database';

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('You must be logged in to use the calendar.');
  return data.user.id;
}

export async function getCalendarEvents(from: Date, through: Date): Promise<CalendarEvent[]> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .lt('starts_at', through.toISOString())
    .gt('ends_at', from.toISOString())
    .order('starts_at');

  if (error) throw error;
  return (data ?? []) as CalendarEvent[];
}

export async function createCalendarEvent(input: CreateCalendarEventInput): Promise<CalendarEvent> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('calendar_events')
    .insert({ ...input, title: input.title.trim(), user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data as CalendarEvent;
}

export async function createCalendarEvents(inputs: CreateCalendarEventInput[]): Promise<CalendarEvent[]> {
  if (inputs.length === 0) throw new Error('Select at least one day.');
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('calendar_events')
    .insert(inputs.map((input) => ({ ...input, title: input.title.trim(), user_id: userId })))
    .select();

  if (error) throw error;
  return (data ?? []) as CalendarEvent[];
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  const userId = await requireUserId();
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function updateCalendarEventForTask(
  taskId: string,
  updates: Pick<CreateCalendarEventInput, 'title' | 'starts_at' | 'ends_at'>,
): Promise<void> {
  const userId = await requireUserId();
  const { error } = await supabase
    .from('calendar_events')
    .update({ ...updates, title: updates.title.trim() })
    .eq('task_id', taskId)
    .eq('user_id', userId);

  if (error) throw error;
}
