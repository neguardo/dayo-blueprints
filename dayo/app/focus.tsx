import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayoButton } from '../components/DayoButton';
import { colors } from '../constants/theme';
import { updateTask } from '../features/tasks/taskService';
import { getErrorMessage } from '../lib/errorMessage';

export default function FocusScreen() {
  const params = useLocalSearchParams<{ id?: string; title?: string; minutes?: string }>();
  const parsedMinutes = Number(params.minutes);
  const focusMinutes = Number.isFinite(parsedMinutes) && parsedMinutes > 0
    ? Math.ceil(parsedMinutes)
    : 25;
  const totalSeconds = focusMinutes * 60;
  const [seconds, setSeconds] = useState(totalSeconds);
  const [running, setRunning] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');
  const completionStarted = useRef(false);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(
      () => setSeconds((value) => (value > 0 ? value - 1 : 0)),
      1000,
    );
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (seconds === 0 && !completionStarted.current) {
      void finish(true);
    }
  }, [seconds]);

  async function finish(timerCompleted = false) {
    if (completionStarted.current) return;
    completionStarted.current = true;
    setRunning(false);
    setFinishing(true);
    setError('');

    try {
      const focusedMinutes = timerCompleted
        ? focusMinutes
        : Math.max(1, Math.ceil((totalSeconds - seconds) / 60));

      if (params.id) {
        await updateTask(params.id, {
          status: 'completed',
          planned_minutes: focusMinutes,
          completed_minutes: focusedMinutes,
          completed_at: new Date().toISOString(),
        });
      }
      router.replace('/(tabs)');
    } catch (caught) {
      completionStarted.current = false;
      setError(getErrorMessage(caught, 'Could not complete this task.'));
    } finally {
      setFinishing(false);
    }
  }

  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const remainder = String(seconds % 60).padStart(2, '0');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={styles.close}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>
        <View style={styles.pill}><Text style={styles.pillText}>FOCUS</Text></View>
        <Text style={styles.timer}>{minutes}:{remainder}</Text>
        <Text style={styles.task}>{params.title || 'Focus session'}</Text>
        <Text style={styles.copy}>You’re doing the right thing right now.</Text>
        <View style={styles.actions}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <DayoButton onPress={() => setRunning((value) => !value)} variant="lime">
            {running ? 'Ⅱ  Pause' : '▶  Resume'}
          </DayoButton>
          <DayoButton loading={finishing} onPress={() => void finish(false)} variant="text">Done</DayoButton>
          <Pressable onPress={() => setRunning(false)}><Text style={styles.stuck}>I can’t focus</Text></Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.navy, flex: 1 },
  content: { alignItems: 'center', flex: 1, padding: 22 },
  close: { alignSelf: 'flex-end', padding: 4 },
  closeText: { color: colors.white, fontSize: 30, fontWeight: '300' },
  pill: { backgroundColor: 'rgba(200,245,90,0.12)', borderRadius: 18, marginTop: 45, paddingHorizontal: 18, paddingVertical: 9 },
  pillText: { color: colors.lime, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  timer: { color: colors.white, fontSize: 57, fontWeight: '600', letterSpacing: 4, marginTop: 47 },
  task: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 22, textAlign: 'center' },
  copy: { color: colors.mutedLight, fontSize: 14, lineHeight: 21, marginTop: 38, maxWidth: 240, textAlign: 'center' },
  actions: { alignSelf: 'stretch', gap: 8, marginTop: 'auto', paddingBottom: 18 },
  error: { color: '#ff9999', fontSize: 12, marginBottom: 5, textAlign: 'center' },
  stuck: { color: colors.mutedLight, fontSize: 13, padding: 12, textAlign: 'center' },
});
