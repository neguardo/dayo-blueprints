import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TaskCard } from '../../components/TaskCard';
import { colors } from '../../constants/theme';
import { getTasks } from '../../features/tasks/taskService';
import type { Task } from '../../types/database';

export default function PlanScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  useFocusEffect(useCallback(() => { void getTasks().then(setTasks).finally(() => setLoading(false)); }, []));
  const dated = tasks.filter((task) => task.deadline);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>YOUR SCHEDULE</Text>
        <Text style={styles.title}>Plan</Text>
        <View style={styles.week}>
          {['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day, index) => <View key={day} style={[styles.day, index === new Date().getDay() - 1 && styles.dayActive]}><Text style={styles.dayLabel}>{day}</Text><Text style={styles.dayNumber}>{new Date().getDate() + index}</Text></View>)}
        </View>
        <Text style={styles.section}>UPCOMING</Text>
        {loading ? <ActivityIndicator color={colors.navy} /> : null}
        <View style={styles.list}>{(dated.length ? dated : tasks).map((task) => <TaskCard key={task.id} task={task} />)}</View>
        {!loading && tasks.length === 0 ? <Text style={styles.empty}>Tasks with a deadline will appear here.</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.paper, flex: 1 }, content: { padding: 22 },
  eyebrow: { color: '#789527', fontSize: 11, fontWeight: '800', letterSpacing: 1.4, marginTop: 10 },
  title: { color: colors.ink, fontSize: 32, fontWeight: '700', marginTop: 7 },
  week: { backgroundColor: colors.white, borderColor: colors.line, borderRadius: 16, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-around', marginTop: 27, padding: 12 },
  day: { alignItems: 'center', borderRadius: 11, paddingHorizontal: 9, paddingVertical: 8 },
  dayActive: { backgroundColor: colors.lime }, dayLabel: { color: colors.muted, fontSize: 9, fontWeight: '700' }, dayNumber: { color: colors.ink, fontSize: 14, fontWeight: '700', marginTop: 5 },
  section: { color: colors.ink, fontSize: 11, fontWeight: '800', letterSpacing: 1.3, marginBottom: 12, marginTop: 31 }, list: { gap: 10 }, empty: { color: colors.muted, fontSize: 14, marginTop: 12, textAlign: 'center' },
});
