import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateTaskModal } from '../../components/CreateTaskModal';
import { DayoButton } from '../../components/DayoButton';
import { DayoLogo } from '../../components/DayoLogo';
import { TaskCard } from '../../components/TaskCard';
import { colors } from '../../constants/theme';
import { useSession } from '../../context/SessionContext';
import { getTasks } from '../../features/tasks/taskService';
import { supabase } from '../../lib/supabase';
import type { Task } from '../../types/database';

export default function TodayScreen() {
  const { session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try { setTasks(await getTasks()); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not load tasks.'); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const firstName = (session?.user.user_metadata.display_name as string | undefined)?.split(' ')[0] || session?.user.email?.split('@')[0] || 'there';
  const openTasks = tasks.filter((task) => task.status !== 'completed' && task.status !== 'cancelled');
  const currentTask = openTasks[0];

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brand}><DayoLogo compact /><Text style={styles.wordmark}>DAYO</Text></View>
          <Pressable onPress={() => void supabase.auth.signOut()} style={styles.avatar}><Text style={styles.avatarText}>{firstName[0].toUpperCase()}</Text></Pressable>
        </View>
        <Text style={styles.greeting}>Good morning,{`\n`}{firstName}.</Text>
        <Text style={styles.subtitle}>Let’s make today count.</Text>

        {currentTask ? (
          <View style={styles.nowCard}>
            <Text style={styles.eyebrow}>NOW</Text>
            <Text style={styles.nowTitle}>{currentTask.title}</Text>
            <View style={styles.metaRow}><Text style={styles.meta}>{currentTask.estimated_minutes} minutes</Text><Text style={styles.meta}>{currentTask.priority}</Text></View>
            <Text style={styles.encouragement}>You have enough time. Let’s make a calm start.</Text>
            <DayoButton onPress={() => router.push({ pathname: '/focus', params: { id: currentTask.id, title: currentTask.title } })} variant="lime">▶  Start focus</DayoButton>
          </View>
        ) : null}

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{currentTask ? 'Up next' : 'Your tasks'}</Text><Pressable onPress={() => setCreateOpen(true)}><Text style={styles.add}>＋ Add</Text></Pressable></View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {loading ? <ActivityIndicator color={colors.navy} /> : null}
        {!loading && tasks.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyIcon}>✓</Text><Text style={styles.emptyTitle}>Your day is clear</Text><Text style={styles.emptyCopy}>Add a task when you’re ready.</Text></View>
        ) : null}
        <View style={styles.list}>{(currentTask ? openTasks.slice(1) : openTasks).map((task) => <TaskCard key={task.id} onPress={() => router.push({ pathname: '/focus', params: { id: task.id, title: task.title } })} task={task} />)}</View>
      </ScrollView>
      <CreateTaskModal onClose={() => setCreateOpen(false)} onCreated={(task) => { setTasks((current) => [task, ...current]); setCreateOpen(false); }} visible={createOpen} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.paper, flex: 1 },
  content: { padding: 22, paddingBottom: 36 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 38 },
  brand: { alignItems: 'center', flexDirection: 'row' },
  wordmark: { color: colors.navy, fontSize: 17, fontWeight: '800', letterSpacing: 5, marginLeft: 10 },
  avatar: { alignItems: 'center', backgroundColor: colors.navy, borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  avatarText: { color: colors.lime, fontSize: 16, fontWeight: '800' },
  greeting: { color: colors.ink, fontSize: 32, fontWeight: '700', lineHeight: 39 },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: 8 },
  nowCard: { backgroundColor: colors.navy, borderRadius: 19, marginTop: 28, padding: 19 },
  eyebrow: { color: colors.lime, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  nowTitle: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 13 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  meta: { color: colors.mutedLight, fontSize: 12, textTransform: 'capitalize' },
  encouragement: { color: '#d9e0e5', fontSize: 13, lineHeight: 19, marginBottom: 17, marginTop: 20 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 13, marginTop: 29 },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '700' },
  add: { color: '#728f25', fontSize: 13, fontWeight: '700' },
  list: { gap: 10 },
  error: { color: colors.danger, fontSize: 13, marginBottom: 12 },
  empty: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.line, borderRadius: 16, borderWidth: 1, padding: 28 },
  emptyIcon: { color: '#8dad31', fontSize: 25 },
  emptyTitle: { color: colors.ink, fontSize: 16, fontWeight: '700', marginTop: 9 },
  emptyCopy: { color: colors.muted, fontSize: 13, marginTop: 5 },
});
