import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from './features/tasks/taskService';
import { supabase } from './lib/supabase';
import type { Task, TaskPriority } from './types/database';

const colors = {
  background: '#061526',
  surface: '#0c2032',
  surfaceLight: '#122a3e',
  border: '#20394d',
  lime: '#c8f55a',
  cream: '#f7f3d9',
  white: '#ffffff',
  muted: '#98a7b4',
  danger: '#ff8d8d',
};

const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function DayoMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.mark, compact && styles.markCompact]}>
      <Text style={[styles.markLetter, compact && styles.markLetterCompact]}>D</Text>
      <View style={[styles.sun, compact && styles.sunCompact]} />
    </View>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) console.warn('Could not restore session:', error.message);
      setSession(data.session);
      setRestoring(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setRestoring(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (restoring) return <SplashScreen />;

  return (
    <View style={styles.app}>
      <StatusBar style="light" />
      {session ? <TodayScreen session={session} /> : <AuthScreen />}
    </View>
  );
}

function SplashScreen() {
  return (
    <View style={styles.splash}>
      <DayoMark />
      <Text style={styles.splashWordmark}>DAYO</Text>
      <ActivityIndicator color={colors.lime} style={styles.splashLoader} />
    </View>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function switchMode(nextMode: 'login' | 'register') {
    setMode(nextMode);
    setError('');
    setNotice('');
  }

  async function submit() {
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) throw new Error('Enter your email address.');
      if (password.length < 6) throw new Error('Your password needs at least 6 characters.');

      if (mode === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { display_name: displayName.trim() || null } },
        });
        if (signUpError) throw signUpError;

        if (!data.session) {
          setNotice('Account created. Check your inbox, confirm your email, then log in.');
          setMode('login');
          setPassword('');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.authKeyboard}
    >
      <ScrollView
        contentContainerStyle={styles.authScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.authHero}>
          <DayoMark />
          <Text style={styles.authWordmark}>DAYO</Text>
          <Text style={styles.authTagline}>Take control of your day.</Text>
        </View>

        <View style={styles.authCard}>
          <Text style={styles.authTitle}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</Text>
          <Text style={styles.authCopy}>
            {mode === 'login'
              ? 'Log in to see your day and keep moving forward.'
              : 'Start planning calmer, more focused days.'}
          </Text>

          {mode === 'register' ? (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                autoCapitalize="words"
                autoComplete="name"
                onChangeText={setDisplayName}
                placeholder="Your name"
                placeholderTextColor="#708291"
                style={styles.input}
                value={displayName}
              />
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#708291"
              style={styles.input}
              value={email}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              onChangeText={setPassword}
              onSubmitEditing={() => void submit()}
              placeholder="At least 6 characters"
              placeholderTextColor="#708291"
              secureTextEntry
              style={styles.input}
              value={password}
            />
          </View>

          {error ? <Text style={styles.errorBox}>{error}</Text> : null}
          {notice ? <Text style={styles.noticeBox}>{notice}</Text> : null}

          <Pressable
            disabled={loading}
            onPress={() => void submit()}
            style={({ pressed }) => [
              styles.primaryButton,
              (pressed || loading) && styles.buttonPressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === 'login' ? 'Log in' : 'Create account'}
              </Text>
            )}
          </Pressable>

          <View style={styles.authSwitchRow}>
            <Text style={styles.authSwitchCopy}>
              {mode === 'login' ? 'New to DAYO?' : 'Already have an account?'}
            </Text>
            <Pressable onPress={() => switchMode(mode === 'login' ? 'register' : 'login')}>
              <Text style={styles.authSwitchLink}>
                {mode === 'login' ? 'Create account' : 'Log in'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function TodayScreen({ session }: { session: Session }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState('');

  const loadTasks = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      setTasks(await getTasks());
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const openTasks = useMemo(
    () => tasks.filter((task) => task.status !== 'completed' && task.status !== 'cancelled'),
    [tasks],
  );
  const completedCount = tasks.filter((task) => task.status === 'completed').length;
  const firstName =
    (session.user.user_metadata.display_name as string | undefined)?.trim().split(/\s+/)[0] ||
    session.user.email?.split('@')[0] ||
    'there';
  const today = new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  async function toggleCompleted(task: Task) {
    const nextCompleted = task.status !== 'completed';
    setError('');
    try {
      const updated = await updateTask(task.id, {
        status: nextCompleted ? 'completed' : 'pending',
        completed_at: nextCompleted ? new Date().toISOString() : null,
      });
      setTasks((current) => current.map((item) => (item.id === task.id ? updated : item)));
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  function confirmDelete(task: Task) {
    Alert.alert('Delete task?', `“${task.title}” will be removed permanently.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteTask(task.id);
              setTasks((current) => current.filter((item) => item.id !== task.id));
            } catch (caught) {
              setError(errorMessage(caught));
            }
          })();
        },
      },
    ]);
  }

  async function logout() {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(signOutError.message);
  }

  return (
    <View style={styles.home}>
      <ScrollView
        contentContainerStyle={styles.homeContent}
        refreshControl={
          <RefreshControl
            onRefresh={() => void loadTasks(true)}
            refreshing={refreshing}
            tintColor={colors.lime}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <DayoMark compact />
            <Text style={styles.homeWordmark}>DAYO</Text>
          </View>
          <Pressable accessibilityLabel="Log out" onPress={() => void logout()} style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          </Pressable>
        </View>

        <Text style={styles.date}>{today.toUpperCase()}</Text>
        <Text style={styles.greeting}>Good morning,{`\n`}{firstName}.</Text>
        <Text style={styles.greetingCopy}>Let’s make today count.</Text>

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryNumber}>{openTasks.length}</Text>
            <Text style={styles.summaryLabel}>tasks left</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View>
            <Text style={styles.summaryNumber}>{completedCount}</Text>
            <Text style={styles.summaryLabel}>completed</Text>
          </View>
          <View style={styles.summarySpark}>
            <Text style={styles.summarySparkText}>✦</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your tasks</Text>
          <Text style={styles.sectionCount}>{tasks.length}</Text>
        </View>

        {error ? <Text style={styles.errorBox}>{error}</Text> : null}
        {loading ? (
          <View style={styles.listLoader}>
            <ActivityIndicator color={colors.lime} />
            <Text style={styles.loadingLabel}>Loading your day…</Text>
          </View>
        ) : null}

        {!loading && tasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>✓</Text>
            </View>
            <Text style={styles.emptyTitle}>A clear day</Text>
            <Text style={styles.emptyCopy}>Add your first task and DAYO will keep it safe for you.</Text>
            <Pressable onPress={() => setCreateOpen(true)} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Add a task</Text>
            </Pressable>
          </View>
        ) : null}

        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            onDelete={() => confirmDelete(task)}
            onToggle={() => void toggleCompleted(task)}
            task={task}
          />
        ))}
        <View style={styles.bottomSpace} />
      </ScrollView>

      <Pressable
        accessibilityLabel="Create a task"
        onPress={() => setCreateOpen(true)}
        style={({ pressed }) => [styles.fab, pressed && styles.buttonPressed]}
      >
        <Text style={styles.fabText}>＋</Text>
      </Pressable>

      <CreateTaskModal
        onClose={() => setCreateOpen(false)}
        onCreated={(task) => {
          setTasks((current) => [task, ...current]);
          setCreateOpen(false);
        }}
        visible={createOpen}
      />
    </View>
  );
}

function TaskCard({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  const completed = task.status === 'completed';
  const deadline = task.deadline
    ? new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(task.deadline))
    : 'No deadline';

  return (
    <View style={[styles.taskCard, completed && styles.taskCardCompleted]}>
      <Pressable
        accessibilityLabel={completed ? 'Mark task as pending' : 'Complete task'}
        onPress={onToggle}
        style={[styles.check, completed && styles.checkCompleted]}
      >
        {completed ? <Text style={styles.checkMark}>✓</Text> : null}
      </Pressable>
      <View style={styles.taskBody}>
        <Text numberOfLines={2} style={[styles.taskTitle, completed && styles.taskTitleCompleted]}>
          {task.title}
        </Text>
        <View style={styles.taskDetails}>
          <Text style={styles.taskDetail}>{task.estimated_minutes} min</Text>
          <View style={styles.detailDot} />
          <Text numberOfLines={1} style={styles.taskDetail}>{deadline}</Text>
        </View>
        <View style={[styles.priorityBadge, styles[`priority_${task.priority}`]]}>
          <Text style={styles.priorityBadgeText}>{task.priority}</Text>
        </View>
      </View>
      <Pressable accessibilityLabel="Delete task" hitSlop={10} onPress={onDelete}>
        <Text style={styles.moreButton}>•••</Text>
      </Pressable>
    </View>
  );
}

function CreateTaskModal({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: (task: Task) => void;
}) {
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function close() {
    if (saving) return;
    setError('');
    onClose();
  }

  async function save() {
    setSaving(true);
    setError('');

    try {
      const estimatedMinutes = Number(minutes);
      if (!title.trim()) throw new Error('Give your task a title.');
      if (!Number.isInteger(estimatedMinutes) || estimatedMinutes <= 0) {
        throw new Error('Estimated time must be a positive number of minutes.');
      }

      let deadlineIso: string | null = null;
      if (deadline.trim()) {
        const parsed = new Date(deadline.trim());
        if (Number.isNaN(parsed.getTime())) {
          throw new Error('Use a deadline like 2026-08-15 17:00.');
        }
        deadlineIso = parsed.toISOString();
      }

      const task = await createTask({
        title,
        estimated_minutes: estimatedMinutes,
        deadline: deadlineIso,
        priority,
        status: 'pending',
      });
      setTitle('');
      setMinutes('');
      setDeadline('');
      setPriority('medium');
      onCreated(task);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal animationType="slide" onRequestClose={close} presentationStyle="pageSheet" visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalKeyboard}
      >
        <ScrollView
          contentContainerStyle={styles.modalContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalEyebrow}>NEW TASK</Text>
              <Text style={styles.modalTitle}>What needs doing?</Text>
            </View>
            <Pressable onPress={close} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              autoFocus
              onChangeText={setTitle}
              placeholder="Finish my portfolio"
              placeholderTextColor="#708291"
              style={styles.input}
              value={title}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Estimated time</Text>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setMinutes}
              placeholder="Minutes"
              placeholderTextColor="#708291"
              style={styles.input}
              value={minutes}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Deadline (optional)</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={setDeadline}
              placeholder="2026-08-15 17:00"
              placeholderTextColor="#708291"
              style={styles.input}
              value={deadline}
            />
          </View>
          <Text style={styles.fieldLabel}>Priority</Text>
          <View style={styles.priorityPicker}>
            {priorities.map((value) => (
              <Pressable
                key={value}
                onPress={() => setPriority(value)}
                style={[styles.priorityOption, priority === value && styles.priorityOptionActive]}
              >
                <Text style={[styles.priorityOptionText, priority === value && styles.priorityOptionTextActive]}>
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>

          {error ? <Text style={styles.errorBox}>{error}</Text> : null}
          <Pressable
            disabled={saving}
            onPress={() => void save()}
            style={({ pressed }) => [
              styles.primaryButton,
              styles.modalSaveButton,
              (pressed || saving) && styles.buttonPressed,
            ]}
          >
            {saving ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.primaryButtonText}>Add to my day</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.background },
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  splashWordmark: { color: colors.cream, fontSize: 28, fontWeight: '700', letterSpacing: 10, marginLeft: 10, marginTop: 18 },
  splashLoader: { marginTop: 34 },
  mark: { width: 78, height: 78, borderColor: colors.cream, borderWidth: 3, borderRadius: 18, justifyContent: 'center', overflow: 'hidden' },
  markCompact: { width: 38, height: 38, borderRadius: 10, borderWidth: 2 },
  markLetter: { color: colors.cream, fontSize: 54, fontWeight: '300', lineHeight: 72, marginLeft: 6 },
  markLetterCompact: { fontSize: 27, lineHeight: 34, marginLeft: 3 },
  sun: { position: 'absolute', width: 43, height: 21, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: colors.lime, bottom: 5, left: 17, borderColor: colors.cream, borderWidth: 2 },
  sunCompact: { width: 21, height: 10, bottom: 3, left: 8, borderWidth: 1 },
  authKeyboard: { flex: 1, backgroundColor: colors.background },
  authScroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 48 },
  authHero: { alignItems: 'center', marginBottom: 34 },
  authWordmark: { color: colors.cream, fontSize: 30, fontWeight: '700', letterSpacing: 10, marginLeft: 10, marginTop: 16 },
  authTagline: { color: colors.muted, fontSize: 14, marginTop: 8 },
  authCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 24, borderWidth: 1, padding: 22 },
  authTitle: { color: colors.white, fontSize: 25, fontWeight: '700' },
  authCopy: { color: colors.muted, fontSize: 14, lineHeight: 21, marginBottom: 24, marginTop: 7 },
  fieldGroup: { marginBottom: 15 },
  fieldLabel: { color: '#c5d0d8', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: colors.background, borderColor: colors.border, borderRadius: 12, borderWidth: 1, color: colors.white, fontSize: 16, paddingHorizontal: 14, paddingVertical: 14 },
  primaryButton: { alignItems: 'center', backgroundColor: colors.lime, borderRadius: 12, minHeight: 52, justifyContent: 'center', marginTop: 8, paddingHorizontal: 18 },
  primaryButtonText: { color: colors.background, fontSize: 16, fontWeight: '700' },
  buttonPressed: { opacity: 0.65 },
  authSwitchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  authSwitchCopy: { color: colors.muted, fontSize: 14 },
  authSwitchLink: { color: colors.lime, fontSize: 14, fontWeight: '700', marginLeft: 6 },
  errorBox: { backgroundColor: 'rgba(255,141,141,0.1)', borderColor: 'rgba(255,141,141,0.35)', borderRadius: 10, borderWidth: 1, color: colors.danger, lineHeight: 19, marginBottom: 10, padding: 11 },
  noticeBox: { backgroundColor: 'rgba(200,245,90,0.08)', borderColor: 'rgba(200,245,90,0.3)', borderRadius: 10, borderWidth: 1, color: colors.lime, lineHeight: 19, marginBottom: 10, padding: 11 },
  home: { flex: 1, backgroundColor: colors.background },
  homeContent: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 64 : 48 },
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 36 },
  brandRow: { alignItems: 'center', flexDirection: 'row' },
  homeWordmark: { color: colors.cream, fontSize: 18, fontWeight: '700', letterSpacing: 5, marginLeft: 11 },
  avatar: { alignItems: 'center', backgroundColor: colors.lime, borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  avatarText: { color: colors.background, fontSize: 16, fontWeight: '800' },
  date: { color: colors.lime, fontSize: 11, fontWeight: '700', letterSpacing: 1.4, marginBottom: 10 },
  greeting: { color: colors.white, fontSize: 34, fontWeight: '700', letterSpacing: -0.8, lineHeight: 40 },
  greetingCopy: { color: colors.muted, fontSize: 15, marginTop: 9 },
  summaryCard: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, flexDirection: 'row', marginTop: 27, overflow: 'hidden', padding: 18 },
  summaryNumber: { color: colors.white, fontSize: 25, fontWeight: '800' },
  summaryLabel: { color: colors.muted, fontSize: 12, marginTop: 2 },
  summaryDivider: { backgroundColor: colors.border, height: 40, marginHorizontal: 24, width: 1 },
  summarySpark: { alignItems: 'center', backgroundColor: 'rgba(200,245,90,0.12)', borderRadius: 24, height: 48, justifyContent: 'center', marginLeft: 'auto', width: 48 },
  summarySparkText: { color: colors.lime, fontSize: 24 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', marginBottom: 14, marginTop: 32 },
  sectionTitle: { color: colors.white, fontSize: 20, fontWeight: '700' },
  sectionCount: { backgroundColor: colors.surfaceLight, borderRadius: 10, color: colors.muted, fontSize: 12, marginLeft: 9, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 3 },
  listLoader: { alignItems: 'center', paddingVertical: 38 },
  loadingLabel: { color: colors.muted, marginTop: 12 },
  emptyCard: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, padding: 28 },
  emptyIcon: { alignItems: 'center', borderColor: colors.lime, borderRadius: 25, borderWidth: 1, height: 50, justifyContent: 'center', width: 50 },
  emptyIconText: { color: colors.lime, fontSize: 22 },
  emptyTitle: { color: colors.white, fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptyCopy: { color: colors.muted, lineHeight: 20, marginTop: 7, textAlign: 'center' },
  emptyButton: { marginTop: 18, padding: 6 },
  emptyButtonText: { color: colors.lime, fontWeight: '700' },
  taskCard: { alignItems: 'flex-start', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: 'row', marginBottom: 11, padding: 15 },
  taskCardCompleted: { opacity: 0.62 },
  check: { borderColor: '#627788', borderRadius: 11, borderWidth: 1.5, height: 22, marginRight: 12, marginTop: 2, width: 22 },
  checkCompleted: { alignItems: 'center', backgroundColor: colors.lime, borderColor: colors.lime, justifyContent: 'center' },
  checkMark: { color: colors.background, fontSize: 13, fontWeight: '900' },
  taskBody: { flex: 1 },
  taskTitle: { color: colors.white, fontSize: 16, fontWeight: '700', lineHeight: 21 },
  taskTitleCompleted: { textDecorationLine: 'line-through' },
  taskDetails: { alignItems: 'center', flexDirection: 'row', marginTop: 7 },
  taskDetail: { color: colors.muted, flexShrink: 1, fontSize: 12 },
  detailDot: { backgroundColor: '#536777', borderRadius: 2, height: 3, marginHorizontal: 7, width: 3 },
  priorityBadge: { alignSelf: 'flex-start', borderRadius: 7, marginTop: 10, paddingHorizontal: 8, paddingVertical: 4 },
  priority_low: { backgroundColor: 'rgba(129,199,255,0.13)' },
  priority_medium: { backgroundColor: 'rgba(200,245,90,0.13)' },
  priority_high: { backgroundColor: 'rgba(255,191,105,0.14)' },
  priority_urgent: { backgroundColor: 'rgba(255,141,141,0.14)' },
  priorityBadgeText: { color: '#c8d2da', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  moreButton: { color: colors.muted, fontSize: 15, letterSpacing: 1, marginLeft: 8 },
  bottomSpace: { height: 110 },
  fab: { alignItems: 'center', backgroundColor: colors.lime, borderRadius: 30, bottom: 28, elevation: 8, height: 60, justifyContent: 'center', position: 'absolute', right: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, width: 60 },
  fabText: { color: colors.background, fontSize: 31, fontWeight: '300', lineHeight: 34 },
  modalKeyboard: { flex: 1, backgroundColor: colors.background },
  modalContent: { flexGrow: 1, paddingBottom: 36, paddingHorizontal: 22, paddingTop: 12 },
  modalHandle: { alignSelf: 'center', backgroundColor: '#415668', borderRadius: 3, height: 5, marginBottom: 26, width: 44 },
  modalHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  modalEyebrow: { color: colors.lime, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  modalTitle: { color: colors.white, fontSize: 27, fontWeight: '700', marginTop: 6 },
  closeButton: { alignItems: 'center', backgroundColor: colors.surfaceLight, borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  closeButtonText: { color: colors.white, fontSize: 25, fontWeight: '300', lineHeight: 27 },
  priorityPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  priorityOption: { borderColor: colors.border, borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9 },
  priorityOptionActive: { backgroundColor: colors.lime, borderColor: colors.lime },
  priorityOptionText: { color: colors.muted, fontSize: 13, textTransform: 'capitalize' },
  priorityOptionTextActive: { color: colors.background, fontWeight: '700' },
  modalSaveButton: { marginTop: 8 },
});
