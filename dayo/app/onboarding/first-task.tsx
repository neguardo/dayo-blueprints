import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { DayoButton } from '../../components/DayoButton';
import { OnboardingHeader } from '../../components/OnboardingHeader';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors } from '../../constants/theme';
import { useOnboarding } from '../../context/OnboardingContext';
import { createTask } from '../../features/tasks/taskService';
import { getErrorMessage } from '../../lib/errorMessage';

export default function FirstTaskScreen() {
  const { data, update } = useOnboarding();
  const [minutes, setMinutes] = useState(String(data.estimatedMinutes));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function createPlan() {
    setLoading(true);
    setError('');
    try {
      const estimatedMinutes = Number(minutes);
      if (!data.firstTask.trim()) throw new Error('Tell DAYO what you need to get done.');
      if (!Number.isInteger(estimatedMinutes) || estimatedMinutes <= 0) throw new Error('Enter a valid number of minutes.');
      const task = await createTask({ title: data.firstTask, estimated_minutes: estimatedMinutes, priority: 'high', status: 'pending' });
      update({ estimatedMinutes, firstTaskId: task.id });
      router.push('/onboarding/generated-plan');
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not create your task.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <OnboardingHeader step={4} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.layout}>
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>LAST STEP</Text>
          <Text style={styles.title}>What’s one thing you need to get done?</Text>
          <Text style={styles.copy}>We’ll build your first day around it.</Text>
        </View>
        <Text style={styles.label}>Task</Text>
        <TextInput autoFocus onChangeText={(firstTask) => update({ firstTask })} placeholder="Finish my portfolio" placeholderTextColor="#999e99" style={styles.input} value={data.firstTask} />
        <Text style={styles.label}>Estimated minutes</Text>
        <TextInput keyboardType="number-pad" onChangeText={setMinutes} placeholder="45" placeholderTextColor="#999e99" style={styles.input} value={minutes} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.bottom}>
          <DayoButton disabled={!data.firstTask.trim()} loading={loading} onPress={() => void createPlan()} variant="lime">✦  Create my plan</DayoButton>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  layout: { flex: 1 },
  intro: { alignItems: 'center', marginBottom: 42, marginTop: 48 },
  eyebrow: { color: '#8aaa2e', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: colors.ink, fontSize: 26, fontWeight: '700', lineHeight: 33, marginTop: 10, maxWidth: 320, textAlign: 'center' },
  copy: { color: colors.muted, fontSize: 14, marginTop: 9 },
  label: { color: colors.ink, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: colors.white, borderColor: colors.line, borderRadius: 14, borderWidth: 1, color: colors.ink, fontSize: 16, marginBottom: 18, padding: 16 },
  error: { color: colors.danger, fontSize: 13 },
  bottom: { marginTop: 'auto', paddingBottom: 10 },
});
