import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../constants/theme';
import { getTasks } from '../../features/tasks/taskService';
import type { Task } from '../../types/database';

export default function ProgressScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  useFocusEffect(useCallback(() => { void getTasks().then(setTasks); }, []));
  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.status === 'completed');
    const percent = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;
    const minutes = completed.reduce(
      (total, task) => total + (task.completed_minutes > 0 ? task.completed_minutes : task.estimated_minutes),
      0,
    );
    return { completed: completed.length, percent, minutes };
  }, [tasks]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>YOUR MOMENTUM</Text><Text style={styles.title}>Progress</Text>
        <View style={styles.mainCard}><Text style={styles.cardLabel}>TASKS COMPLETED</Text><Text style={styles.percent}>{stats.percent}%</Text><Text style={styles.description}>of all your DAYO tasks</Text><View style={styles.track}><View style={[styles.fill, { width: `${stats.percent}%` }]} /></View></View>
        <View style={styles.stats}><View style={styles.stat}><Text style={styles.statNumber}>{stats.completed}</Text><Text style={styles.statLabel}>completed tasks</Text></View><View style={styles.stat}><Text style={styles.statNumber}>{Math.floor(stats.minutes / 60)}h {stats.minutes % 60}m</Text><Text style={styles.statLabel}>focused time</Text></View></View>
        <View style={styles.insight}><Text style={styles.insightSpark}>✦</Text><Text style={styles.insightTitle}>Small steps still count.</Text><Text style={styles.insightCopy}>Every completed task is proof that you’re moving forward.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.paper, flex: 1 }, content: { padding: 22 }, eyebrow: { color: '#789527', fontSize: 11, fontWeight: '800', letterSpacing: 1.4, marginTop: 10 }, title: { color: colors.ink, fontSize: 32, fontWeight: '700', marginTop: 7 },
  mainCard: { backgroundColor: colors.navy, borderRadius: 19, marginTop: 27, padding: 21 }, cardLabel: { color: colors.lime, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 }, percent: { color: colors.white, fontSize: 48, fontWeight: '800', marginTop: 15 }, description: { color: colors.mutedLight, fontSize: 12, marginTop: 2 }, track: { backgroundColor: colors.navySoft, borderRadius: 4, height: 8, marginTop: 20, overflow: 'hidden' }, fill: { backgroundColor: colors.lime, borderRadius: 4, height: 8 },
  stats: { flexDirection: 'row', gap: 11, marginTop: 12 }, stat: { backgroundColor: colors.white, borderColor: colors.line, borderRadius: 16, borderWidth: 1, flex: 1, padding: 17 }, statNumber: { color: colors.ink, fontSize: 21, fontWeight: '800' }, statLabel: { color: colors.muted, fontSize: 11, marginTop: 6 }, insight: { alignItems: 'center', backgroundColor: '#eff6dc', borderRadius: 17, marginTop: 12, padding: 22 }, insightSpark: { color: '#83a727', fontSize: 21 }, insightTitle: { color: colors.ink, fontSize: 16, fontWeight: '700', marginTop: 8 }, insightCopy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6, textAlign: 'center' },
});
