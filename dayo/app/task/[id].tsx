import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayoButton } from '../../components/DayoButton';
import { colors } from '../../constants/theme';
import { deleteTask, getTaskById, updateTask } from '../../features/tasks/taskService';
import { getErrorMessage } from '../../lib/errorMessage';
import type { Task } from '../../types/database';

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function combineDateTime(day: Date, time: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time.trim());
  if (!match) return null;
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), Number(match[1]), Number(match[2]));
}

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [selectedDay, setSelectedDay] = useState(startOfDay(new Date()));
  const [time, setTime] = useState('09:00');
  const [minutes, setMinutes] = useState('');
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    void getTaskById(id)
      .then((loadedTask) => {
        const planned = loadedTask.deadline ? new Date(loadedTask.deadline) : new Date();
        setTask(loadedTask);
        setTitle(loadedTask.title);
        setSelectedDay(startOfDay(planned));
        setTime(planned.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
        setMinutes(String(loadedTask.estimated_minutes));
      })
      .catch((caught) => setError(getErrorMessage(caught, 'Could not load this task.')))
      .finally(() => setLoading(false));
  }, [id]);

  async function save() {
    if (!task) return;
    setSaving(true);
    setError('');
    try {
      const deadline = combineDateTime(selectedDay, time);
      const estimatedMinutes = Number(minutes);
      if (!title.trim()) throw new Error('The task needs a title.');
      if (!deadline) throw new Error('Use time format HH:MM, for example 14:30.');
      if (!Number.isInteger(estimatedMinutes) || estimatedMinutes <= 0) throw new Error('Enter a valid duration in minutes.');
      await updateTask(task.id, {
        title: title.trim(),
        deadline: deadline.toISOString(),
        estimated_minutes: estimatedMinutes,
      });
      router.replace('/(tabs)/plan');
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not update this task.'));
    } finally {
      setSaving(false);
    }
  }

  function requestDelete() {
    if (!task) return;
    Alert.alert('Delete task?', `“${task.title}” will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void remove() },
    ]);
  }

  async function remove() {
    if (!task) return;
    setDeleting(true);
    setError('');
    try {
      await deleteTask(task.id);
      router.replace('/(tabs)/plan');
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not delete this task.'));
      setDeleting(false);
    }
  }

  if (loading) {
    return <SafeAreaView style={styles.loading}><ActivityIndicator color={colors.lime} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable hitSlop={12} onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
          <Text style={styles.headerTitle}>Edit task</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.eyebrow}>TASK DETAILS</Text>
        <TextInput onChangeText={setTitle} style={styles.titleInput} value={title} />

        <Pressable onPress={() => setDateOpen(true)} style={styles.optionCard}>
          <View style={styles.optionIcon}><Text style={styles.optionIconText}>▦</Text></View>
          <View style={styles.optionBody}><Text style={styles.optionLabel}>Move to another day</Text><Text style={styles.optionValue}>{selectedDay.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text></View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable onPress={() => setTimeOpen(true)} style={styles.optionCard}>
          <View style={styles.optionIcon}><Text style={styles.optionIconText}>◷</Text></View>
          <View style={styles.optionBody}><Text style={styles.optionLabel}>Edit time</Text><Text style={styles.optionValue}>{time} · {minutes} minutes</Text></View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.bottomActions}>
          <DayoButton loading={saving} onPress={() => void save()} variant="lime">Save changes</DayoButton>
          <Pressable disabled={deleting} onPress={requestDelete} style={styles.deleteButton}>
            {deleting ? <ActivityIndicator color={colors.danger} /> : <Text style={styles.deleteText}>Delete task</Text>}
          </Pressable>
        </View>
      </ScrollView>

      <DatePickerModal
        initialDate={selectedDay}
        onClose={() => setDateOpen(false)}
        onSelect={(date) => { setSelectedDay(date); setDateOpen(false); }}
        visible={dateOpen}
      />
      <TimeEditorModal
        initialMinutes={minutes}
        initialTime={time}
        onClose={() => setTimeOpen(false)}
        onSave={(nextTime, nextMinutes) => { setTime(nextTime); setMinutes(nextMinutes); setTimeOpen(false); }}
        visible={timeOpen}
      />
    </SafeAreaView>
  );
}

function DatePickerModal({ visible, initialDate, onClose, onSelect }: { visible: boolean; initialDate: Date; onClose: () => void; onSelect: (date: Date) => void }) {
  const [month, setMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  useEffect(() => {
    if (visible) setMonth(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  }, [initialDate, visible]);
  const offset = (month.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const number = index - offset + 1;
    return number > 0 && number <= days ? new Date(month.getFullYear(), month.getMonth(), number) : null;
  });

  return (
    <Modal animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet" visible={visible}>
      <SafeAreaView style={styles.dateSafe}>
        <View style={styles.dateContent}>
          <View style={styles.dateHeader}><Pressable onPress={onClose}><Text style={styles.modalClose}>×</Text></Pressable><Text style={styles.dateTitle}>Move task</Text><View style={styles.headerSpacer} /></View>
          <View style={styles.monthNav}><Pressable onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} style={styles.navButton}><Text style={styles.navText}>‹</Text></Pressable><Text style={styles.monthTitle}>{month.toLocaleDateString('en', { month: 'long', year: 'numeric' })}</Text><Pressable onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} style={styles.navButton}><Text style={styles.navText}>›</Text></Pressable></View>
          <View style={styles.weekdays}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <Text key={`${day}-${index}`} style={styles.weekday}>{day}</Text>)}</View>
          <View style={styles.monthGrid}>{cells.map((date, index) => date ? <Pressable key={date.toISOString()} onPress={() => onSelect(date)} style={[styles.dayCell, sameDay(date, initialDate) && styles.dayCellActive, sameDay(date, new Date()) && styles.dayCellToday]}><Text style={[styles.dayCellText, sameDay(date, initialDate) && styles.dayCellTextActive]}>{date.getDate()}</Text></Pressable> : <View key={`blank-${index}`} style={styles.dayCell} />)}</View>
          <Text style={styles.dateHint}>This calendar intentionally shows no other tasks. Select a day to move this task there.</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function TimeEditorModal({ visible, initialTime, initialMinutes, onClose, onSave }: { visible: boolean; initialTime: string; initialMinutes: string; onClose: () => void; onSave: (time: string, minutes: string) => void }) {
  const [nextTime, setNextTime] = useState(initialTime);
  const [nextMinutes, setNextMinutes] = useState(initialMinutes);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setNextTime(initialTime);
    setNextMinutes(initialMinutes);
    setError('');
  }, [initialMinutes, initialTime, visible]);

  function apply() {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(nextTime)) { setError('Use time format HH:MM.'); return; }
    if (!Number.isInteger(Number(nextMinutes)) || Number(nextMinutes) <= 0) { setError('Enter a valid duration.'); return; }
    setError(''); onSave(nextTime, nextMinutes);
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet" visible={visible}>
      <SafeAreaView style={styles.timeSafe}>
        <View style={styles.timeContent}>
          <View style={styles.dateHeader}><Pressable onPress={onClose}><Text style={styles.modalCloseLight}>×</Text></Pressable><Text style={styles.timeTitle}>Edit time</Text><View style={styles.headerSpacer} /></View>
          <Text style={styles.timeLabel}>Start time</Text><TextInput keyboardType="numbers-and-punctuation" maxLength={5} onChangeText={setNextTime} style={styles.timeInput} value={nextTime} />
          <Text style={styles.timeLabel}>Activity duration in minutes</Text><TextInput keyboardType="number-pad" onChangeText={setNextMinutes} style={styles.timeInput} value={nextMinutes} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.timeBottom}><DayoButton onPress={apply} variant="lime">Apply time</DayoButton></View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', backgroundColor: colors.navy, flex: 1, justifyContent: 'center' }, safe: { backgroundColor: colors.paper, flex: 1 }, content: { flexGrow: 1, padding: 22 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35 }, back: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 }, backText: { color: colors.ink, fontSize: 34, lineHeight: 36 }, headerTitle: { color: colors.ink, fontSize: 18, fontWeight: '700' }, headerSpacer: { width: 40 },
  eyebrow: { color: '#789527', fontSize: 10, fontWeight: '800', letterSpacing: 1.4, marginBottom: 9 }, titleInput: { backgroundColor: colors.white, borderColor: colors.line, borderRadius: 14, borderWidth: 1, color: colors.ink, fontSize: 20, fontWeight: '700', marginBottom: 24, padding: 17 },
  optionCard: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.line, borderRadius: 15, borderWidth: 1, flexDirection: 'row', marginBottom: 11, minHeight: 78, padding: 13 }, optionIcon: { alignItems: 'center', backgroundColor: '#eff6dc', borderRadius: 20, height: 40, justifyContent: 'center', marginRight: 12, width: 40 }, optionIconText: { color: '#769421', fontSize: 19 }, optionBody: { flex: 1 }, optionLabel: { color: colors.ink, fontSize: 14, fontWeight: '700' }, optionValue: { color: colors.muted, fontSize: 11, marginTop: 5 }, chevron: { color: '#9ba29c', fontSize: 25 },
  error: { color: colors.danger, fontSize: 13, marginTop: 12 }, bottomActions: { gap: 8, marginTop: 'auto', paddingTop: 30 }, deleteButton: { alignItems: 'center', borderColor: '#e9c3c3', borderRadius: 13, borderWidth: 1, minHeight: 50, justifyContent: 'center' }, deleteText: { color: colors.danger, fontSize: 14, fontWeight: '700' },
  dateSafe: { backgroundColor: '#f5f5f2', flex: 1 }, dateContent: { flex: 1, padding: 20 }, dateHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, modalClose: { color: colors.ink, fontSize: 31, width: 40 }, dateTitle: { color: colors.ink, fontSize: 19, fontWeight: '700' }, monthNav: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 32 }, navButton: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.line, borderRadius: 19, borderWidth: 1, height: 38, justifyContent: 'center', width: 38 }, navText: { color: colors.ink, fontSize: 27 }, monthTitle: { color: colors.ink, fontSize: 21, fontWeight: '800' }, weekdays: { flexDirection: 'row', marginTop: 30 }, weekday: { color: colors.muted, flex: 1, fontSize: 11, fontWeight: '700', textAlign: 'center' }, monthGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }, dayCell: { alignItems: 'center', height: 52, justifyContent: 'center', width: '14.2857%' }, dayCellActive: { backgroundColor: colors.lime, borderRadius: 14 }, dayCellToday: { borderColor: colors.navy, borderRadius: 14, borderWidth: 1 }, dayCellText: { color: colors.ink, fontSize: 14, fontWeight: '600' }, dayCellTextActive: { color: colors.navy, fontWeight: '800' }, dateHint: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 20, textAlign: 'center' },
  timeSafe: { backgroundColor: colors.navy, flex: 1 }, timeContent: { flex: 1, padding: 22 }, modalCloseLight: { color: colors.white, fontSize: 31, width: 40 }, timeTitle: { color: colors.white, fontSize: 19, fontWeight: '700' }, timeLabel: { color: '#cbd4db', fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 25 }, timeInput: { backgroundColor: colors.navyLight, borderColor: colors.darkLine, borderRadius: 13, borderWidth: 1, color: colors.white, fontSize: 23, padding: 16 }, timeBottom: { marginTop: 'auto', paddingBottom: 10 },
});
