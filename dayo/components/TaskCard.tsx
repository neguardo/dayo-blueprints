import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';
import type { Task } from '../types/database';

export function TaskCard({ task, onPress }: { task: Task; onPress?: () => void }) {
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.icon}><Text style={styles.iconText}>{task.status === 'completed' ? '✓' : '✦'}</Text></View>
      <View style={styles.body}>
        <Text numberOfLines={2} style={[styles.title, task.status === 'completed' && styles.done]}>{task.title}</Text>
        <Text style={styles.meta}>{task.estimated_minutes} min · {task.priority}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.line, borderRadius: 15, borderWidth: 1, flexDirection: 'row', minHeight: 68, padding: 13 },
  pressed: { opacity: 0.72 },
  icon: { alignItems: 'center', backgroundColor: '#eff6dc', borderRadius: 18, height: 36, justifyContent: 'center', marginRight: 11, width: 36 },
  iconText: { color: '#8bad2f', fontSize: 16 },
  body: { flex: 1 },
  title: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  done: { color: colors.muted, textDecorationLine: 'line-through' },
  meta: { color: colors.muted, fontSize: 11, marginTop: 5, textTransform: 'capitalize' },
  chevron: { color: '#a3aaa3', fontSize: 24, marginLeft: 8 },
});
