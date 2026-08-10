import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Session } from '@supabase/supabase-js';

import { createTask, getTasks } from './features/tasks/taskService';
import { supabase } from './lib/supabase';
import type { Task, TaskPriority } from './types/database';

const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

function messageFrom(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setCheckingSession(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (checkingSession) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#c8f55a" size="large" />
        <Text style={styles.loadingText}>Restoring session…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.app}
    >
      <StatusBar style="light" />
      {session ? <TaskScreen email={session.user.email ?? ''} /> : <AuthScreen />}
    </KeyboardAvoidingView>
  );
}

function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function authenticate(mode: 'login' | 'register') {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (!email.trim() || password.length < 6) {
        throw new Error('Enter an email and a password of at least 6 characters.');
      }

      if (mode === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setMessage('Account created. Check your email to confirm your account.');
        }
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (loginError) throw loginError;
      }
    } catch (caught) {
      setError(messageFrom(caught));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.authContainer} keyboardShouldPersistTaps="handled">
      <Text style={styles.logo}>DAYO</Text>
      <Text style={styles.subtitle}>Development authentication</Text>
      <TextInput
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#7f8b98"
        style={styles.input}
        value={email}
      />
      <TextInput
        autoCapitalize="none"
        autoComplete="password"
        onChangeText={setPassword}
        placeholder="Password (minimum 6 characters)"
        placeholderTextColor="#7f8b98"
        secureTextEntry
        style={styles.input}
        value={password}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}
      <Pressable
        disabled={loading}
        onPress={() => authenticate('login')}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>{loading ? 'Please wait…' : 'Login'}</Text>
      </Pressable>
      <Pressable
        disabled={loading}
        onPress={() => authenticate('register')}
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
      >
        <Text style={styles.secondaryButtonText}>Create account</Text>
      </Pressable>
    </ScrollView>
  );
}

function TaskScreen({ email }: { email: string }) {
  const [title, setTitle] = useState('Finish my portfolio');
  const [minutes, setMinutes] = useState('180');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadTasks = useCallback(async () => {
    setLoadingTasks(true);
    setError('');
    try {
      setTasks(await getTasks());
    } catch (caught) {
      setError(messageFrom(caught));
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  async function handleCreateTask() {
    setSaving(true);
    setError('');
    try {
      const estimatedMinutes = Number(minutes);
      if (!title.trim()) throw new Error('Title is required.');
      if (!Number.isInteger(estimatedMinutes) || estimatedMinutes <= 0) {
        throw new Error('Estimated minutes must be a positive whole number.');
      }

      let deadlineIso: string | null = null;
      if (deadline.trim()) {
        const parsed = new Date(deadline.trim());
        if (Number.isNaN(parsed.getTime())) {
          throw new Error('Use a valid deadline, for example 2026-08-15T17:00.');
        }
        deadlineIso = parsed.toISOString();
      }

      await createTask({
        title,
        estimated_minutes: estimatedMinutes,
        deadline: deadlineIso,
        priority,
        status: 'pending',
      });
      setTitle('');
      setMinutes('');
      setDeadline('');
      await loadTasks();
    } catch (caught) {
      setError(messageFrom(caught));
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    setError('');
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) setError(logoutError.message);
  }

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View>
          <Text style={styles.logoSmall}>DAYO</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>
        <Pressable onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <Text style={styles.heading}>Create task</Text>
      <TextInput
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor="#7f8b98"
        style={styles.input}
        value={title}
      />
      <TextInput
        keyboardType="number-pad"
        onChangeText={setMinutes}
        placeholder="Estimated minutes"
        placeholderTextColor="#7f8b98"
        style={styles.input}
        value={minutes}
      />
      <TextInput
        autoCapitalize="none"
        onChangeText={setDeadline}
        placeholder="Deadline, e.g. 2026-08-15T17:00"
        placeholderTextColor="#7f8b98"
        style={styles.input}
        value={deadline}
      />
      <Text style={styles.label}>Priority</Text>
      <View style={styles.priorityRow}>
        {priorities.map((value) => (
          <Pressable
            key={value}
            onPress={() => setPriority(value)}
            style={[styles.priority, priority === value && styles.priorityActive]}
          >
            <Text style={[styles.priorityText, priority === value && styles.priorityTextActive]}>
              {value}
            </Text>
          </Pressable>
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        disabled={saving}
        onPress={handleCreateTask}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Create task'}</Text>
      </Pressable>

      <View style={styles.tasksHeader}>
        <Text style={styles.heading}>Your tasks</Text>
        <Pressable onPress={loadTasks}>
          <Text style={styles.refresh}>Refresh</Text>
        </Pressable>
      </View>
      {loadingTasks ? <ActivityIndicator color="#c8f55a" /> : null}
      {!loadingTasks && tasks.length === 0 ? (
        <Text style={styles.empty}>No tasks yet.</Text>
      ) : null}
      {tasks.map((task) => (
        <View key={task.id} style={styles.taskCard}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskMeta}>
            {task.estimated_minutes} min · {task.priority.toUpperCase()} ·{' '}
            {task.status.toUpperCase()}
          </Text>
          {task.deadline ? (
            <Text style={styles.deadline}>Deadline: {new Date(task.deadline).toLocaleString()}</Text>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#061526' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#061526' },
  loadingText: { color: '#fff', marginTop: 12 },
  authContainer: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#061526' },
  screen: { flexGrow: 1, padding: 24, paddingTop: 64, backgroundColor: '#061526' },
  logo: { color: '#d4ff56', fontSize: 36, fontWeight: '700', letterSpacing: 10, marginBottom: 8 },
  logoSmall: { color: '#d4ff56', fontSize: 24, fontWeight: '700', letterSpacing: 6 },
  subtitle: { color: '#b9c4ce', marginBottom: 28 },
  input: { backgroundColor: '#10283c', borderColor: '#254158', borderWidth: 1, borderRadius: 10, color: '#fff', fontSize: 16, marginBottom: 12, paddingHorizontal: 14, paddingVertical: 13 },
  button: { alignItems: 'center', backgroundColor: '#c8f55a', borderRadius: 10, marginTop: 6, padding: 14 },
  buttonText: { color: '#061526', fontSize: 16, fontWeight: '700' },
  secondaryButton: { alignItems: 'center', borderColor: '#c8f55a', borderRadius: 10, borderWidth: 1, marginTop: 12, padding: 14 },
  secondaryButtonText: { color: '#c8f55a', fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.75 },
  error: { color: '#ff9b9b', marginBottom: 8 },
  success: { color: '#c8f55a', marginBottom: 8 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  userEmail: { color: '#91a0ad', fontSize: 12, marginTop: 4 },
  logoutButton: { borderColor: '#557084', borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  logoutText: { color: '#fff' },
  heading: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 14 },
  label: { color: '#b9c4ce', marginBottom: 8 },
  priorityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  priority: { borderColor: '#557084', borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  priorityActive: { backgroundColor: '#c8f55a', borderColor: '#c8f55a' },
  priorityText: { color: '#b9c4ce', textTransform: 'capitalize' },
  priorityTextActive: { color: '#061526', fontWeight: '700' },
  tasksHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 38 },
  refresh: { color: '#c8f55a', marginBottom: 14 },
  empty: { color: '#91a0ad' },
  taskCard: { backgroundColor: '#10283c', borderColor: '#254158', borderRadius: 12, borderWidth: 1, marginBottom: 12, padding: 16 },
  taskTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 7 },
  taskMeta: { color: '#c8f55a', fontSize: 12 },
  deadline: { color: '#b9c4ce', fontSize: 12, marginTop: 7 },
});
