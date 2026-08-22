import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../constants/theme';
import { useSession } from '../../context/SessionContext';
import {
  getUserPreferences,
  updatePlanningBehavior,
} from '../../features/preferences/preferencesService';
import { getErrorMessage } from '../../lib/errorMessage';
import type { PlanningBehavior } from '../../types/database';

const behaviorOptions: Array<{
  value: PlanningBehavior;
  title: string;
  description: string;
}> = [
  { value: 'light', title: 'Light', description: 'DAYO intervenes very little.' },
  { value: 'balanced', title: 'Balanced', description: 'DAYO helps actively but asks permission.' },
  { value: 'proactive', title: 'Proactive', description: 'DAYO plans and reschedules more for you.' },
];

const sections = [
  { icon: '≡', slug: 'planning-preferences', title: 'Planning Preferences', subtitle: 'Work rhythm, breaks and availability' },
  { icon: '✦', slug: 'smart-planning', title: 'Smart Planning', subtitle: 'AI planning controls' },
  { icon: '◉', slug: 'notifications', title: 'Notifications', subtitle: 'Reminders and planning updates' },
  { icon: '◷', slug: 'focus', title: 'Focus', subtitle: 'Focus sessions and breaks' },
  { icon: '☼', slug: 'appearance', title: 'Appearance', subtitle: 'Theme and display preferences' },
  { icon: '◇', slug: 'privacy', title: 'Privacy', subtitle: 'Privacy policy, cookies and data' },
];

export default function SettingsScreen() {
  const { session } = useSession();
  const [behavior, setBehavior] = useState<PlanningBehavior>('balanced');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<PlanningBehavior | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void getUserPreferences()
      .then((preferences) => setBehavior(preferences.planning_behavior ?? 'balanced'))
      .catch((caught) => setError(getErrorMessage(caught, 'Could not load settings.')))
      .finally(() => setLoading(false));
  }, []);

  async function selectBehavior(value: PlanningBehavior) {
    const previous = behavior;
    setBehavior(value);
    setSaving(value);
    setError('');
    try {
      await updatePlanningBehavior(value);
    } catch (caught) {
      setBehavior(previous);
      setError(getErrorMessage(caught, 'Could not save planning behavior.'));
    } finally {
      setSaving(null);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable hitSlop={12} onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
          <Text style={styles.title}>Settings</Text><View style={styles.headerSpacer} />
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <Pressable onPress={() => router.push({ pathname: '/settings/[section]', params: { section: 'account' } })} style={styles.accountCard}>
          <View style={styles.accountAvatar}><Text style={styles.accountAvatarText}>{session?.user.email?.[0].toUpperCase() ?? 'D'}</Text></View>
          <View style={styles.accountBody}><Text style={styles.accountTitle}>Account</Text><Text style={styles.accountEmail}>{session?.user.email}</Text></View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Text style={styles.subsectionTitle}>Planning behavior</Text>
        <Text style={styles.subsectionCopy}>Choose how actively DAYO’s future AI planner should help you.</Text>
        {loading ? <ActivityIndicator color={colors.navy} style={styles.loader} /> : (
          <View style={styles.behaviors}>
            {behaviorOptions.map((option) => {
              const selected = behavior === option.value;
              return (
                <Pressable key={option.value} onPress={() => void selectBehavior(option.value)} style={[styles.behaviorCard, selected && styles.behaviorSelected]}>
                  <View style={styles.behaviorBody}><Text style={styles.behaviorTitle}>{option.title}</Text><Text style={styles.behaviorDescription}>{option.description}</Text></View>
                  {saving === option.value ? <ActivityIndicator color={colors.navy} size="small" /> : <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>}
                </Pressable>
              );
            })}
          </View>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.settingsList}>
          {sections.map((section, index) => (
            <Pressable key={section.title} onPress={() => router.push({ pathname: '/settings/[section]', params: { section: section.slug } })} style={[styles.settingsRow, index > 0 && styles.settingsRowBorder]}>
              <View style={styles.settingsIcon}><Text style={styles.settingsIconText}>{section.icon}</Text></View>
              <View style={styles.settingsBody}><Text style={styles.settingsTitle}>{section.title}</Text><Text style={styles.settingsSubtitle}>{section.subtitle}</Text></View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.paper, flex: 1 }, content: { padding: 22, paddingBottom: 40 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 }, back: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 }, backText: { color: colors.ink, fontSize: 34, lineHeight: 36 }, title: { color: colors.ink, fontSize: 20, fontWeight: '700' }, headerSpacer: { width: 40 },
  sectionLabel: { color: '#769321', fontSize: 10, fontWeight: '800', letterSpacing: 1.4, marginBottom: 10, marginTop: 8 }, accountCard: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.line, borderRadius: 16, borderWidth: 1, flexDirection: 'row', padding: 14 }, accountAvatar: { alignItems: 'center', backgroundColor: colors.navy, borderRadius: 21, height: 42, justifyContent: 'center', marginRight: 12, width: 42 }, accountAvatarText: { color: colors.lime, fontSize: 16, fontWeight: '800' }, accountBody: { flex: 1 }, accountTitle: { color: colors.ink, fontSize: 15, fontWeight: '700' }, accountEmail: { color: colors.muted, fontSize: 11, marginTop: 4 }, chevron: { color: '#9ba39e', fontSize: 24 },
  subsectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '700', marginTop: 25 }, subsectionCopy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginBottom: 13, marginTop: 5 }, loader: { marginVertical: 24 }, behaviors: { gap: 9 }, behaviorCard: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.line, borderRadius: 14, borderWidth: 1, flexDirection: 'row', minHeight: 68, padding: 13 }, behaviorSelected: { backgroundColor: '#eff8d8', borderColor: '#a8d42d' }, behaviorBody: { flex: 1, paddingRight: 10 }, behaviorTitle: { color: colors.ink, fontSize: 14, fontWeight: '700' }, behaviorDescription: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 4 }, radio: { alignItems: 'center', borderColor: '#a9b1ab', borderRadius: 11, borderWidth: 1, height: 22, justifyContent: 'center', width: 22 }, radioSelected: { borderColor: '#7f9f26', borderWidth: 2 }, radioDot: { backgroundColor: '#7f9f26', borderRadius: 5, height: 10, width: 10 }, error: { color: colors.danger, fontSize: 12, marginTop: 11 },
  settingsList: { backgroundColor: colors.white, borderColor: colors.line, borderRadius: 16, borderWidth: 1, overflow: 'hidden' }, settingsRow: { alignItems: 'center', flexDirection: 'row', minHeight: 69, padding: 13 }, settingsRowBorder: { borderTopColor: colors.line, borderTopWidth: 1 }, settingsIcon: { alignItems: 'center', backgroundColor: '#eff6dc', borderRadius: 18, height: 36, justifyContent: 'center', marginRight: 11, width: 36 }, settingsIconText: { color: '#769321', fontSize: 16 }, settingsBody: { flex: 1 }, settingsTitle: { color: colors.ink, fontSize: 14, fontWeight: '700' }, settingsSubtitle: { color: colors.muted, fontSize: 10, marginTop: 4 },
});
