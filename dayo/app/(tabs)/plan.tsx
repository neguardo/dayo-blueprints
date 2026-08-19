import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { TaskCard } from '../../components/TaskCard';
import { colors } from '../../constants/theme';
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvents,
} from '../../features/calendar/calendarService';
import { getTasks } from '../../features/tasks/taskService';
import { getErrorMessage } from '../../lib/errorMessage';
import type { CalendarEvent, CalendarEventType, Task } from '../../types/database';

const dayMs = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function startOfWeek(date: Date) {
  const result = startOfDay(date);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
}

function combineDateTime(day: Date, time: string): Date | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time.trim());
  if (!match) return null;
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), Number(match[1]), Number(match[2]));
}

export default function PlanScreen() {
  const [selectedDay, setSelectedDay] = useState(startOfDay(new Date()));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [monthOpen, setMonthOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const weekStart = useMemo(() => startOfWeek(selectedDay), [selectedDay]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => new Date(weekStart.getTime() + index * dayMs)),
    [weekStart],
  );
  const visibleFrom = useMemo(() => new Date(selectedDay.getFullYear(), selectedDay.getMonth() - 1, 1), [selectedDay]);
  const visibleThrough = useMemo(() => new Date(selectedDay.getFullYear(), selectedDay.getMonth() + 2, 1), [selectedDay]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [calendarEvents, currentTasks] = await Promise.all([
        getCalendarEvents(visibleFrom, visibleThrough),
        getTasks(),
      ]);
      setEvents(calendarEvents);
      setTasks(currentTasks.filter((task) => task.status !== 'completed' && task.status !== 'cancelled'));
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not load your calendar.'));
    } finally {
      setLoading(false);
    }
  }, [visibleFrom, visibleThrough]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const selectedEvents = events.filter((event) => sameDay(new Date(event.starts_at), selectedDay));
  const selectedTasks = tasks.filter((task) => {
    const taskDate = task.deadline ? new Date(task.deadline) : new Date();
    return sameDay(taskDate, selectedDay);
  });

  async function removeEvent(event: CalendarEvent) {
    setError('');
    try {
      await deleteCalendarEvent(event.id);
      setEvents((current) => current.filter((item) => item.id !== event.id));
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not delete this item.'));
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View><Text style={styles.eyebrow}>YOUR SCHEDULE</Text><Text style={styles.title}>Plan</Text></View>
          <Pressable onPress={() => setMonthOpen(true)} style={styles.monthButton}>
            <Text style={styles.monthIcon}>▦</Text><Text style={styles.monthButtonText}>Month</Text>
          </Pressable>
        </View>

        <View style={styles.week}>
          {weekDays.map((day) => {
            const active = sameDay(day, selectedDay);
            const hasEvents = events.some((event) => sameDay(new Date(event.starts_at), day))
              || tasks.some((task) => sameDay(task.deadline ? new Date(task.deadline) : new Date(), day));
            return (
              <Pressable key={day.toISOString()} onPress={() => setSelectedDay(day)} style={[styles.day, active && styles.dayActive]}>
                <Text style={[styles.dayLabel, active && styles.dayTextActive]}>{day.toLocaleDateString('en', { weekday: 'narrow' })}</Text>
                <Text style={[styles.dayNumber, active && styles.dayTextActive]}>{day.getDate()}</Text>
                <View style={[styles.eventDot, hasEvents && styles.eventDotVisible, active && hasEvents && styles.eventDotActive]} />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.selectedHeader}>
          <View>
            <Text style={styles.selectedLabel}>{selectedDay.toLocaleDateString('en', { weekday: 'long' }).toUpperCase()}</Text>
            <Text style={styles.selectedDate}>{selectedDay.toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          </View>
          <Pressable onPress={() => setCreateOpen(true)} style={styles.addButton}><Text style={styles.addButtonText}>＋ Add</Text></Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {loading ? <ActivityIndicator color={colors.navy} style={styles.loader} /> : null}
        {!loading && selectedEvents.length === 0 && selectedTasks.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>◷</Text><Text style={styles.emptyTitle}>Nothing planned yet</Text>
            <Text style={styles.emptyCopy}>Add an activity or reserve time with a fixed block.</Text>
          </View>
        ) : null}
        <View style={styles.timeline}>
          {selectedEvents.map((event) => (
            <Pressable key={event.id} onLongPress={() => void removeEvent(event)} style={[styles.eventCard, event.event_type === 'fixed' && styles.fixedCard]}>
              <View style={[styles.eventBar, event.event_type === 'fixed' && styles.fixedBar]} />
              <View style={styles.eventBody}>
                <Text style={styles.eventTime}>{new Date(event.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(event.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventType}>{event.event_type === 'fixed' ? 'FIXED · TIME RESERVED' : 'ACTIVITY'}</Text>
              </View>
            </Pressable>
          ))}
          {selectedTasks.map((task) => (
            <TaskCard
              key={task.id}
              onPress={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })}
              task={task}
            />
          ))}
        </View>
        {selectedEvents.length > 0 ? <Text style={styles.deleteHint}>Hold a calendar item to delete it.</Text> : null}
      </ScrollView>

      <MonthModal
        events={events}
        initialDate={selectedDay}
        tasks={tasks}
        onAdd={(date) => { setSelectedDay(date); setMonthOpen(false); setCreateOpen(true); }}
        onClose={() => setMonthOpen(false)}
        onSelect={(date) => { setSelectedDay(date); setMonthOpen(false); }}
        visible={monthOpen}
      />
      <EventModal
        day={selectedDay}
        onClose={() => setCreateOpen(false)}
        onCreated={(event) => { setEvents((current) => [...current, event].sort((a, b) => a.starts_at.localeCompare(b.starts_at))); setCreateOpen(false); }}
        visible={createOpen}
      />
    </SafeAreaView>
  );
}

function MonthModal({ visible, initialDate, events, tasks, onClose, onSelect, onAdd }: {
  visible: boolean; initialDate: Date; events: CalendarEvent[]; tasks: Task[]; onClose: () => void; onSelect: (date: Date) => void; onAdd: (date: Date) => void;
}) {
  const [month, setMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const offset = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - offset + 1;
    return dayNumber >= 1 && dayNumber <= daysInMonth ? new Date(month.getFullYear(), month.getMonth(), dayNumber) : null;
  });

  return (
    <Modal animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet" visible={visible}>
      <SafeAreaView style={styles.modalSafe}>
        <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.monthTopBar}>
            <Pressable onPress={onClose} style={styles.squareButton}><Text style={styles.close}>×</Text></Pressable>
            <Pressable onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} style={styles.squareButton}><Text style={styles.arrowText}>‹</Text></Pressable>
            <Text numberOfLines={1} style={styles.modalTitle}>{month.toLocaleDateString('en', { month: 'long', year: 'numeric' })}</Text>
            <Pressable onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} style={styles.squareButton}><Text style={styles.arrowText}>›</Text></Pressable>
          </View>
          <View style={styles.monthActionRow}>
            <View style={styles.viewSwitcher}><View style={styles.viewActive}><Text style={styles.viewActiveText}>Month</Text></View><Text style={styles.viewText}>Week</Text><Text style={styles.viewText}>Day</Text><Text style={styles.viewText}>Agenda</Text></View>
            <Pressable onPress={() => { const today = startOfDay(new Date()); setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); }} style={styles.todayButton}><Text style={styles.todayButtonText}>Today</Text></Pressable>
            <Pressable onPress={() => onAdd(initialDate)} style={styles.plusButton}><Text style={styles.plusText}>＋</Text></Pressable>
          </View>
          <View style={styles.weekdayRow}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <Text key={`${day}-${index}`} style={styles.weekday}>{day}</Text>)}</View>
          <View style={styles.monthGrid}>
            {cells.map((date, index) => {
              const dayEvents = date ? events.filter((event) => sameDay(new Date(event.starts_at), date)) : [];
              const dayTasks = date ? tasks.filter((task) => {
                const taskDate = task.deadline ? new Date(task.deadline) : new Date();
                return sameDay(taskDate, date);
              }) : [];
              const firstEvent = dayEvents[0];
              const firstTask = dayTasks[0];
              return date ? (
                <Pressable key={date.toISOString()} onPress={() => onSelect(date)} style={[styles.monthCell, sameDay(date, new Date()) && styles.monthCellToday]}>
                  <Text style={[styles.monthCellText, sameDay(date, new Date()) && styles.todayNumber]}>{date.getDate()}</Text>
                  {sameDay(date, new Date()) ? <Text style={styles.todayCellLabel}>Today</Text> : null}
                  {firstEvent ? (
                    <View style={[styles.monthEvent, firstEvent.event_type === 'fixed' && styles.monthEventFixed]}>
                      <View style={[styles.monthEventDot, firstEvent.event_type === 'fixed' && styles.monthEventDotFixed]} />
                      <Text numberOfLines={1} style={styles.monthEventTitle}>{firstEvent.title}</Text>
                      <Text style={styles.monthEventTime}>{new Date(firstEvent.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                  ) : firstTask ? (
                    <View style={styles.monthTask}>
                      <View style={styles.monthTaskDot} />
                      <Text numberOfLines={1} style={styles.monthEventTitle}>{firstTask.title}</Text>
                      <Text style={styles.monthEventTime}>{firstTask.deadline ? new Date(firstTask.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `${firstTask.estimated_minutes}m · unscheduled`}</Text>
                    </View>
                  ) : null}
                  {dayEvents.length + dayTasks.length > 1 ? <Text style={styles.moreEvents}>+{dayEvents.length + dayTasks.length - 1}</Text> : null}
                </Pressable>
              ) : <View key={`blank-${index}`} style={[styles.monthCell, styles.monthCellBlank]} />;
            })}
          </View>
          <Text style={styles.monthHint}>Tap a day to open it. Use + to add an item to the selected day.</Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function EventModal({ visible, day, onClose, onCreated }: { visible: boolean; day: Date; onClose: () => void; onCreated: (event: CalendarEvent) => void }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarEventType>('activity');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    setSaving(true); setError('');
    try {
      const startsAt = combineDateTime(day, startTime);
      const endsAt = combineDateTime(day, endTime);
      if (!title.trim()) throw new Error('Enter a title.');
      if (!startsAt || !endsAt) throw new Error('Use time format HH:MM, for example 09:30.');
      if (endsAt <= startsAt) throw new Error('The end time must be after the start time.');
      const event = await createCalendarEvent({ title, event_type: type, starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString() });
      setTitle(''); setError(''); onCreated(event);
    } catch (caught) {
      const message = getErrorMessage(caught, 'Could not add this item.');
      setError(message.includes('overlaps') ? 'That time is already occupied. Choose a free time.' : message);
    } finally { setSaving(false); }
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet" visible={visible}>
      <SafeAreaView style={styles.eventModalSafe}>
        <ScrollView contentContainerStyle={styles.eventModalContent} keyboardShouldPersistTaps="handled">
          <View style={styles.eventModalHeader}><View><Text style={styles.modalEyebrow}>NEW CALENDAR ITEM</Text><Text style={styles.eventModalTitle}>{day.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' })}</Text></View><Pressable onPress={onClose}><Text style={styles.eventClose}>×</Text></Pressable></View>
          <Text style={styles.fieldLabel}>Type</Text>
          <View style={styles.typeRow}>
            <Pressable onPress={() => setType('activity')} style={[styles.typeCard, type === 'activity' && styles.typeCardActive]}><Text style={styles.typeIcon}>▶</Text><Text style={styles.typeTitle}>Activity</Text><Text style={styles.typeCopy}>A task or focus session</Text></Pressable>
            <Pressable onPress={() => setType('fixed')} style={[styles.typeCard, type === 'fixed' && styles.typeCardActive]}><Text style={styles.typeIcon}>▣</Text><Text style={styles.typeTitle}>Fixed block</Text><Text style={styles.typeCopy}>Work, school or travel</Text></Pressable>
          </View>
          <Text style={styles.fieldLabel}>Title</Text>
          <TextInput autoFocus onChangeText={setTitle} placeholder={type === 'fixed' ? 'Work' : 'Study PHP'} placeholderTextColor="#778691" style={styles.input} value={title} />
          <View style={styles.timeInputs}><View style={styles.timeField}><Text style={styles.fieldLabel}>Start</Text><TextInput keyboardType="numbers-and-punctuation" maxLength={5} onChangeText={setStartTime} style={styles.input} value={startTime} /></View><View style={styles.timeField}><Text style={styles.fieldLabel}>End</Text><TextInput keyboardType="numbers-and-punctuation" maxLength={5} onChangeText={setEndTime} style={styles.input} value={endTime} /></View></View>
          <Text style={styles.reserveNote}>{type === 'fixed' ? 'This entire period will be reserved. No other activities can overlap it.' : 'Activities also reserve their selected time to prevent double booking.'}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <DayoButton loading={saving} onPress={() => void save()} variant="lime">Add to plan</DayoButton>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.paper, flex: 1 }, content: { padding: 22, paddingBottom: 40 },
  titleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, eyebrow: { color: '#789527', fontSize: 11, fontWeight: '800', letterSpacing: 1.4, marginTop: 10 }, title: { color: colors.ink, fontSize: 32, fontWeight: '700', marginTop: 7 },
  monthButton: { alignItems: 'center', backgroundColor: colors.navy, borderRadius: 12, flexDirection: 'row', gap: 7, paddingHorizontal: 13, paddingVertical: 10 }, monthIcon: { color: colors.lime, fontSize: 16 }, monthButtonText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  week: { backgroundColor: colors.white, borderColor: colors.line, borderRadius: 16, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 25, padding: 8 }, day: { alignItems: 'center', borderRadius: 11, flex: 1, paddingVertical: 8 }, dayActive: { backgroundColor: colors.lime }, dayLabel: { color: colors.muted, fontSize: 10, fontWeight: '700' }, dayNumber: { color: colors.ink, fontSize: 14, fontWeight: '700', marginTop: 5 }, dayTextActive: { color: colors.navy }, eventDot: { borderRadius: 2, height: 4, marginTop: 5, width: 4 }, eventDotVisible: { backgroundColor: colors.navy }, eventDotActive: { backgroundColor: colors.white },
  selectedHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }, selectedLabel: { color: '#789527', fontSize: 10, fontWeight: '800', letterSpacing: 1.3 }, selectedDate: { color: colors.ink, fontSize: 18, fontWeight: '700', marginTop: 5 }, addButton: { backgroundColor: colors.navy, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 10 }, addButtonText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  loader: { marginTop: 35 }, error: { color: colors.danger, fontSize: 13, marginTop: 16 }, empty: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.line, borderRadius: 16, borderWidth: 1, marginTop: 19, padding: 28 }, emptyIcon: { color: '#8dab35', fontSize: 25 }, emptyTitle: { color: colors.ink, fontSize: 16, fontWeight: '700', marginTop: 9 }, emptyCopy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6, textAlign: 'center' },
  timeline: { gap: 10, marginTop: 19 }, eventCard: { backgroundColor: colors.white, borderColor: colors.line, borderRadius: 14, borderWidth: 1, flexDirection: 'row', minHeight: 82, overflow: 'hidden' }, fixedCard: { backgroundColor: '#e9f2f6' }, eventBar: { backgroundColor: colors.lime, width: 6 }, fixedBar: { backgroundColor: '#77a9be' }, eventBody: { flex: 1, padding: 13 }, eventTime: { color: colors.muted, fontSize: 11, fontWeight: '600' }, eventTitle: { color: colors.ink, fontSize: 15, fontWeight: '700', marginTop: 5 }, eventType: { color: '#779128', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 7 }, deleteHint: { color: colors.muted, fontSize: 10, marginTop: 12, textAlign: 'center' },
  modalSafe: { backgroundColor: '#f5f5f2', flex: 1 }, modalContent: { flexGrow: 1, padding: 14, paddingBottom: 28 },
  monthTopBar: { alignItems: 'center', flexDirection: 'row', gap: 8 }, squareButton: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.line, borderRadius: 12, borderWidth: 1, height: 42, justifyContent: 'center', width: 42 }, close: { color: colors.ink, fontSize: 27, fontWeight: '300', lineHeight: 29 }, arrowText: { color: colors.ink, fontSize: 27, fontWeight: '400', lineHeight: 29 }, modalTitle: { color: colors.ink, flex: 1, fontSize: 21, fontWeight: '800', marginLeft: 3 },
  monthActionRow: { alignItems: 'center', flexDirection: 'row', gap: 7, marginTop: 15 }, viewSwitcher: { alignItems: 'center', backgroundColor: '#ecece8', borderRadius: 12, flex: 1, flexDirection: 'row', padding: 3 }, viewActive: { backgroundColor: colors.lime, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 9 }, viewActiveText: { color: colors.ink, fontSize: 10, fontWeight: '800' }, viewText: { color: '#4e5458', flex: 1, fontSize: 9, textAlign: 'center' }, todayButton: { backgroundColor: colors.lime, borderRadius: 11, paddingHorizontal: 11, paddingVertical: 12 }, todayButtonText: { color: colors.ink, fontSize: 10, fontWeight: '800' }, plusButton: { alignItems: 'center', backgroundColor: colors.navy, borderRadius: 11, height: 40, justifyContent: 'center', width: 40 }, plusText: { color: colors.white, fontSize: 23, lineHeight: 25 },
  weekdayRow: { flexDirection: 'row', marginTop: 22, paddingHorizontal: 2 }, weekday: { color: '#50575b', flex: 1, fontSize: 10, fontWeight: '800', textAlign: 'center' }, monthGrid: { backgroundColor: colors.white, borderColor: '#dedfda', borderRadius: 14, borderWidth: 1, flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, overflow: 'hidden' }, monthCell: { alignItems: 'flex-start', borderBottomColor: '#e5e6e1', borderBottomWidth: 1, borderRightColor: '#e5e6e1', borderRightWidth: 1, height: 76, padding: 6, width: '14.2857%' }, monthCellBlank: { backgroundColor: '#fafaf8' }, monthCellToday: { backgroundColor: '#e7fbb0', borderColor: '#98c90f', borderRadius: 9, borderWidth: 1 }, monthCellText: { color: colors.ink, fontSize: 12, fontWeight: '800' }, todayNumber: { backgroundColor: colors.navy, borderRadius: 7, color: colors.white, overflow: 'hidden', paddingHorizontal: 5, paddingVertical: 2 }, todayCellLabel: { color: colors.ink, fontSize: 7, fontWeight: '700', marginTop: 4 },
  monthEvent: { backgroundColor: '#f3f4ef', borderRadius: 6, marginTop: 5, padding: 4, width: '100%' }, monthEventFixed: { backgroundColor: '#e7f0f4' }, monthTask: { backgroundColor: '#eef4fb', borderRadius: 6, marginTop: 5, padding: 4, width: '100%' }, monthEventDot: { backgroundColor: '#99cf0d', borderRadius: 3, height: 5, position: 'absolute', top: 6, width: 5 }, monthEventDotFixed: { backgroundColor: '#3292ed' }, monthTaskDot: { backgroundColor: '#3292ed', borderRadius: 3, height: 5, position: 'absolute', top: 6, width: 5 }, monthEventTitle: { color: colors.ink, fontSize: 7, fontWeight: '700', marginLeft: 8 }, monthEventTime: { color: '#4e5b64', fontSize: 6, marginLeft: 8, marginTop: 2 }, moreEvents: { color: colors.muted, fontSize: 7, fontWeight: '700', marginTop: 2 }, monthHint: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 13, textAlign: 'center' },
  eventModalSafe: { backgroundColor: colors.navy, flex: 1 }, eventModalContent: { flexGrow: 1, padding: 22 }, eventModalHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 }, modalEyebrow: { color: colors.lime, fontSize: 10, fontWeight: '800', letterSpacing: 1.3 }, eventModalTitle: { color: colors.white, fontSize: 23, fontWeight: '700', marginTop: 7 }, eventClose: { color: colors.white, fontSize: 31 }, fieldLabel: { color: '#cbd4db', fontSize: 12, fontWeight: '700', marginBottom: 8 }, typeRow: { flexDirection: 'row', gap: 10, marginBottom: 24 }, typeCard: { backgroundColor: colors.navyLight, borderColor: colors.darkLine, borderRadius: 14, borderWidth: 1, flex: 1, padding: 13 }, typeCardActive: { borderColor: colors.lime, borderWidth: 2 }, typeIcon: { color: colors.lime, fontSize: 17 }, typeTitle: { color: colors.white, fontSize: 14, fontWeight: '700', marginTop: 9 }, typeCopy: { color: colors.mutedLight, fontSize: 10, lineHeight: 15, marginTop: 4 }, input: { backgroundColor: colors.navyLight, borderColor: colors.darkLine, borderRadius: 12, borderWidth: 1, color: colors.white, fontSize: 16, marginBottom: 19, padding: 14 }, timeInputs: { flexDirection: 'row', gap: 12 }, timeField: { flex: 1 }, reserveNote: { color: colors.mutedLight, fontSize: 11, lineHeight: 17, marginBottom: 17 },
});
