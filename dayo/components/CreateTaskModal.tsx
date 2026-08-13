import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../constants/theme';
import { createTask } from '../features/tasks/taskService';
import { getErrorMessage } from '../lib/errorMessage';
import type { Task, TaskPriority } from '../types/database';
import { DayoButton } from './DayoButton';

export function CreateTaskModal({ visible, onClose, onCreated }: { visible: boolean; onClose: () => void; onCreated: (task: Task) => void }) {
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    setLoading(true);
    setError('');
    try {
      const estimatedMinutes = Number(minutes);
      if (!title.trim()) throw new Error('Give your task a title.');
      if (!Number.isInteger(estimatedMinutes) || estimatedMinutes <= 0) throw new Error('Enter a valid number of minutes.');
      const task = await createTask({ title, estimated_minutes: estimatedMinutes, priority, status: 'pending' });
      setTitle('');
      setMinutes('');
      setPriority('medium');
      onCreated(task);
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not create your task.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet" visible={visible}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <View><Text style={styles.eyebrow}>NEW TASK</Text><Text style={styles.title}>What needs doing?</Text></View>
              <Pressable hitSlop={10} onPress={onClose}><Text style={styles.close}>×</Text></Pressable>
            </View>
            <Text style={styles.label}>Task</Text>
            <TextInput autoFocus onChangeText={setTitle} placeholder="Finish my portfolio" placeholderTextColor="#87908a" style={styles.input} value={title} />
            <Text style={styles.label}>Estimated minutes</Text>
            <TextInput keyboardType="number-pad" onChangeText={setMinutes} placeholder="45" placeholderTextColor="#87908a" style={styles.input} value={minutes} />
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorities}>
              {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((value) => (
                <Pressable key={value} onPress={() => setPriority(value)} style={[styles.priority, priority === value && styles.priorityActive]}>
                  <Text style={[styles.priorityText, priority === value && styles.priorityTextActive]}>{value}</Text>
                </Pressable>
              ))}
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <DayoButton disabled={!title.trim()} loading={loading} onPress={() => void save()} variant="lime">Add to my day</DayoButton>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.navy, flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 22 },
  header: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 38 },
  eyebrow: { color: colors.lime, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: colors.white, fontSize: 27, fontWeight: '700', marginTop: 7 },
  close: { color: colors.white, fontSize: 32, fontWeight: '300' },
  label: { color: '#ccd4da', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: colors.navyLight, borderColor: colors.darkLine, borderRadius: 13, borderWidth: 1, color: colors.white, fontSize: 16, marginBottom: 20, padding: 15 },
  priorities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  priority: { borderColor: colors.darkLine, borderRadius: 18, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 9 },
  priorityActive: { backgroundColor: colors.lime, borderColor: colors.lime },
  priorityText: { color: colors.mutedLight, fontSize: 13, textTransform: 'capitalize' },
  priorityTextActive: { color: colors.navy, fontWeight: '700' },
  error: { color: '#ff9999', fontSize: 13, marginBottom: 13 },
});
