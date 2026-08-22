import { supabase } from '../../lib/supabase';
import type { CreateTaskInput, Task, UpdateTaskInput } from '../../types/database';

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  if (!data.user) throw new Error('You must be logged in to manage tasks.');

  return data.user.id;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...input,
      title: input.title.trim(),
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function getTasks(): Promise<Task[]> {
  const userId = await requireUserId();
  const { error: expiryError } = await supabase.rpc('expire_overdue_tasks');
  if (expiryError) throw expiryError;
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Task[];
}

export async function getTaskById(taskId: string): Promise<Task> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data as Task;
}

export async function updateTask(
  taskId: string,
  updates: UpdateTaskInput,
): Promise<Task> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function deleteTask(taskId: string): Promise<void> {
  const userId = await requireUserId();
  const { error: calendarError } = await supabase
    .from('calendar_events')
    .delete()
    .eq('task_id', taskId)
    .eq('user_id', userId);

  if (calendarError) throw calendarError;
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) throw error;
}
