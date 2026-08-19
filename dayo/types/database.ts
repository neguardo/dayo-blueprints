export type ProductivityPeriod = 'morning' | 'afternoon' | 'evening' | 'varies';
export type PreferredFocusPeriod = 'morning' | 'afternoon' | 'evening' | 'none';
export type SubscriptionType = 'free' | 'pro';
export type PlanningBehavior = 'light' | 'balanced' | 'proactive';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus =
  | 'pending'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'missed'
  | 'cancelled';
export type CalendarEventType = 'activity' | 'fixed';

export interface CalendarEvent {
  id: string;
  user_id: string;
  task_id: string | null;
  title: string;
  event_type: CalendarEventType;
  starts_at: string;
  ends_at: string;
  created_at: string;
}

export interface CreateCalendarEventInput {
  title: string;
  event_type: CalendarEventType;
  starts_at: string;
  ends_at: string;
  task_id?: string | null;
}

export interface Profile {
  id: string;
  display_name: string | null;
  timezone: string;
  wake_time: string;
  sleep_time: string;
  productivity_period: ProductivityPeriod | null;
  subscription_type: SubscriptionType;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  estimated_minutes: number;
  deadline: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  planned_minutes: number;
  completed_minutes: number;
  created_at: string;
  completed_at: string | null;
}

export interface UserPreferences {
  user_id: string;
  max_focus_minutes: number;
  break_minutes: number;
  minimum_free_minutes_per_day: number;
  preferred_focus_period: PreferredFocusPeriod;
  notifications_enabled: boolean;
  auto_reschedule_enabled: boolean;
  planning_behavior: PlanningBehavior;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  estimated_minutes: number;
  deadline?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  description?: string | null;
  category?: string | null;
}

export type UpdateTaskInput = Partial<
  Pick<
    Task,
    | 'title'
    | 'description'
    | 'category'
    | 'estimated_minutes'
    | 'deadline'
    | 'priority'
    | 'status'
    | 'planned_minutes'
    | 'completed_minutes'
    | 'completed_at'
  >
>;
