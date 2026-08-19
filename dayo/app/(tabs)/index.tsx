import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

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
        <View style={styles.hero}>
          <View style={styles.header}>
            <View style={styles.brand}><DayoLogo compact /><Text style={styles.wordmark}>DAYO</Text></View>
            <Pressable accessibilityLabel="Open account menu" onPress={() => setMenuOpen((open) => !open)} style={styles.avatar}>
              <View style={styles.profileHead} />
              <View style={styles.profileBody} />
            </Pressable>
            {menuOpen ? (
              <View style={styles.accountMenu}>
                <Pressable onPress={() => { setMenuOpen(false); router.push('/settings'); }} style={styles.menuItem}>
                  <Text style={styles.menuIcon}>⚙</Text><Text style={styles.menuText}>Settings</Text><Text style={styles.menuChevron}>›</Text>
                </Pressable>
                <View style={styles.menuDivider} />
                <Pressable onPress={() => void supabase.auth.signOut()} style={styles.menuItem}>
                  <Text style={styles.logoutIcon}>↪</Text><Text style={styles.logoutText}>Log out</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
          <Text style={styles.greeting}>Good morning,{`\n`}{firstName}.</Text>
          <Text style={styles.subtitle}>Let’s make today count.</Text>
        </View>

        {currentTask ? (
          <View style={styles.nowCard}>
            <Text style={styles.eyebrow}>NOW</Text>
            <Text style={styles.nowTitle}>{currentTask.title}</Text>
            <View style={styles.metaRow}><Text style={styles.meta}>{currentTask.estimated_minutes} minutes</Text><Text style={styles.meta}>{currentTask.priority}</Text></View>
            <Text style={styles.encouragement}>You have enough time. Let’s make a calm start.</Text>
            <DayoButton onPress={() => router.push({ pathname: '/focus', params: { id: currentTask.id, title: currentTask.title, minutes: String(currentTask.estimated_minutes) } })} variant="lime">▶  Start focus</DayoButton>
          </View>
        ) : null}

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{currentTask ? 'Up next' : 'Your tasks'}</Text></View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {loading ? <ActivityIndicator color={colors.navy} /> : null}
        {!loading && tasks.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyIcon}>✓</Text><Text style={styles.emptyTitle}>Your day is clear</Text><Text style={styles.emptyCopy}>Add a task when you’re ready.</Text></View>
        ) : null}
        <View style={styles.list}>{(currentTask ? openTasks.slice(1) : openTasks).map((task) => <TaskCard key={task.id} onPress={() => router.push({ pathname: '/focus', params: { id: task.id, title: task.title, minutes: String(task.estimated_minutes) } })} task={task} />)}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.navy, flex: 1 },
  content: { backgroundColor: colors.paper, paddingBottom: 36 },
  hero: { backgroundColor: colors.navy, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: 28, paddingHorizontal: 22, paddingTop: 14 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 34, position: 'relative', zIndex: 10 },
  brand: { alignItems: 'center', flexDirection: 'row' },
  wordmark: { color: colors.cream, fontSize: 17, fontWeight: '800', letterSpacing: 5, marginLeft: 10 },
  avatar: { alignItems: 'center', borderColor: 'rgba(255,255,255,0.35)', borderRadius: 20, borderWidth: 1, height: 40, justifyContent: 'center', width: 40 },
  profileHead: { backgroundColor: colors.white, borderRadius: 5, height: 10, marginBottom: 3, width: 10 },
  profileBody: { backgroundColor: colors.white, borderTopLeftRadius: 8, borderTopRightRadius: 8, height: 9, width: 18 },
  accountMenu: { backgroundColor: colors.white, borderColor: colors.line, borderRadius: 14, borderWidth: 1, elevation: 10, minWidth: 175, padding: 6, position: 'absolute', right: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.2, shadowRadius: 14, top: 49 },
  menuItem: { alignItems: 'center', flexDirection: 'row', minHeight: 45, paddingHorizontal: 10 },
  menuIcon: { color: colors.navy, fontSize: 17, marginRight: 10 }, menuText: { color: colors.ink, flex: 1, fontSize: 14, fontWeight: '600' }, menuChevron: { color: colors.muted, fontSize: 21 },
  menuDivider: { backgroundColor: colors.line, height: 1, marginHorizontal: 7 }, logoutIcon: { color: colors.danger, fontSize: 18, marginRight: 10 }, logoutText: { color: colors.danger, fontSize: 14, fontWeight: '600' },
  greeting: { color: colors.white, fontSize: 32, fontWeight: '700', lineHeight: 39 },
  subtitle: { color: colors.mutedLight, fontSize: 14, marginTop: 8 },
  nowCard: { backgroundColor: colors.navy, borderRadius: 19, marginHorizontal: 22, marginTop: 22, padding: 19 },
  eyebrow: { color: colors.lime, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  nowTitle: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 13 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  meta: { color: colors.mutedLight, fontSize: 12, textTransform: 'capitalize' },
  encouragement: { color: '#d9e0e5', fontSize: 13, lineHeight: 19, marginBottom: 17, marginTop: 20 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 13, marginHorizontal: 22, marginTop: 29 },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '700' },
  list: { gap: 10, paddingHorizontal: 22 },
  error: { color: colors.danger, fontSize: 13, marginBottom: 12, marginHorizontal: 22 },
  empty: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.line, borderRadius: 16, borderWidth: 1, marginHorizontal: 22, padding: 28 },
  emptyIcon: { color: '#8dad31', fontSize: 25 },
  emptyTitle: { color: colors.ink, fontSize: 16, fontWeight: '700', marginTop: 9 },
  emptyCopy: { color: colors.muted, fontSize: 13, marginTop: 5 },
});
