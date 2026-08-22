import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../constants/theme';
import { useSession } from '../../context/SessionContext';
import { getUserPreferences, updateUserPreferences } from '../../features/preferences/preferencesService';
import { getErrorMessage } from '../../lib/errorMessage';
import { supabase } from '../../lib/supabase';
import type { PlanningBehavior, PreferredFocusPeriod, UserPreferences } from '../../types/database';

const titles: Record<string, string> = {
  account: 'Account',
  'planning-preferences': 'Planning Preferences',
  'smart-planning': 'Smart Planning',
  notifications: 'Notifications',
  focus: 'Focus',
  appearance: 'Appearance',
  privacy: 'Privacy',
};

export default function PreferenceSectionScreen() {
  const { section = '' } = useLocalSearchParams<{ section: string }>();
  const { session } = useSession();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(!['account', 'appearance', 'privacy'].includes(section));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (['account', 'appearance', 'privacy'].includes(section)) return;
    setLoading(true);
    void getUserPreferences()
      .then(setPreferences)
      .catch((caught) => setError(getErrorMessage(caught, 'Could not load your preferences.')))
      .finally(() => setLoading(false));
  }, [section]);

  async function save(updates: Parameters<typeof updateUserPreferences>[0]) {
    setSaving(true);
    setError('');
    try {
      setPreferences(await updateUserPreferences(updates));
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not save your preference.'));
    } finally {
      setSaving(false);
    }
  }

  async function sendPasswordReset() {
    const email = session?.user.email;
    if (!email) return;
    setSaving(true); setError(''); setMessage('');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    if (resetError) setError(resetError.message);
    else setMessage('A password reset link has been sent to your email.');
    setSaving(false);
  }

  function content() {
    if (section === 'account') return (
      <>
        <SectionLabel>PROFILE</SectionLabel>
        <InfoCard label="Email address" value={session?.user.email ?? 'No email available'} />
        <InfoCard label="Account ID" value={session?.user.id ?? 'Unavailable'} />
        <SectionLabel>SECURITY</SectionLabel>
        <ActionRow description="Receive a secure link by email." label="Reset password" onPress={() => void sendPasswordReset()} />
        <ActionRow danger description="Return to the login screen on this device." label="Log out" onPress={() => void supabase.auth.signOut()} />
      </>
    );

    if (section === 'appearance') return (
      <>
        <SectionLabel>THEME</SectionLabel>
        <ChoiceCard description="The current DAYO color scheme." label="Light" selected />
        <ChoiceCard description="Follow your device appearance. Coming soon." disabled label="System" />
        <ChoiceCard description="A low-light DAYO theme. Coming soon." disabled label="Dark" />
        <SectionLabel>DISPLAY</SectionLabel>
        <InfoCard label="Mobile layout" value="Optimized" />
        <InfoCard label="Calendar density" value="Comfortable" />
      </>
    );

    if (section === 'privacy') return (
      <>
        <SectionLabel>LEGAL</SectionLabel>
        <ActionRow description="Read how DAYO collects, uses and protects data." label="Privacy Policy" onPress={() => router.push('/settings/privacy-policy')} />
        <ActionRow description="Read about essential browser storage and cookies." label="Cookie Policy" onPress={() => router.push('/settings/cookie-policy')} />
        <SectionLabel>YOUR DATA</SectionLabel>
        <InfoCard label="Task visibility" value="Private to your account" />
        <InfoCard label="Database protection" value="Supabase Row Level Security" />
      </>
    );

    if (!preferences) return null;

    if (section === 'planning-preferences') return (
      <>
        <SectionLabel>PREFERRED FOCUS PERIOD</SectionLabel>
        <ChoiceGroup values={['morning', 'afternoon', 'evening', 'none']} selected={preferences.preferred_focus_period} onSelect={(value) => void save({ preferred_focus_period: value as PreferredFocusPeriod })} />
        <SectionLabel>DAILY FREE TIME</SectionLabel>
        <ChoiceGroup suffix=" min" values={[30, 60, 90, 120]} selected={preferences.minimum_free_minutes_per_day} onSelect={(value) => void save({ minimum_free_minutes_per_day: Number(value) })} />
        <ToggleRow description="Move unfinished tasks to a suitable free time." label="Automatically reschedule" value={preferences.auto_reschedule_enabled} onChange={(value) => void save({ auto_reschedule_enabled: value })} />
      </>
    );

    if (section === 'smart-planning') return (
      <>
        <SectionLabel>PLANNING BEHAVIOR</SectionLabel>
        {(['light', 'balanced', 'proactive'] as PlanningBehavior[]).map((value) => <ChoiceCard key={value} description={value === 'light' ? 'DAYO intervenes very little.' : value === 'balanced' ? 'DAYO helps actively but asks permission.' : 'DAYO plans and reschedules more for you.'} label={value[0].toUpperCase() + value.slice(1)} selected={preferences.planning_behavior === value} onPress={() => void save({ planning_behavior: value })} />)}
        <ToggleRow description="Allow DAYO to find another time when plans change." label="Smart rescheduling" value={preferences.auto_reschedule_enabled} onChange={(value) => void save({ auto_reschedule_enabled: value })} />
      </>
    );

    if (section === 'notifications') return (
      <>
        <SectionLabel>REMINDERS</SectionLabel>
        <ToggleRow description="Enable DAYO reminders and planning updates." label="Allow notifications" value={preferences.notifications_enabled} onChange={(value) => void save({ notifications_enabled: value })} />
        <InfoCard label="Task reminders" value={preferences.notifications_enabled ? 'Enabled' : 'Disabled'} />
        <InfoCard label="Schedule changes" value={preferences.notifications_enabled ? 'Enabled' : 'Disabled'} />
      </>
    );

    if (section === 'focus') return (
      <>
        <SectionLabel>MAXIMUM FOCUS SESSION</SectionLabel>
        <ChoiceGroup suffix=" min" values={[25, 45, 60, 90]} selected={preferences.max_focus_minutes} onSelect={(value) => void save({ max_focus_minutes: Number(value) })} />
        <SectionLabel>BREAK LENGTH</SectionLabel>
        <ChoiceGroup suffix=" min" values={[5, 10, 15, 20]} selected={preferences.break_minutes} onSelect={(value) => void save({ break_minutes: Number(value) })} />
      </>
    );

    return <InfoCard label="Not found" value="This preference section does not exist." />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Pressable hitSlop={12} onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.title}>{titles[section] ?? 'Preferences'}</Text><View style={styles.headerSpacer} /></View>
        {loading ? <ActivityIndicator color={colors.navy} style={styles.loader} /> : content()}
        {saving ? <ActivityIndicator color={colors.navy} style={styles.saving} /> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ children }: { children: string }) { return <Text style={styles.sectionLabel}>{children}</Text>; }
function InfoCard({ label, value }: { label: string; value: string }) { return <View style={styles.infoCard}><Text style={styles.rowLabel}>{label}</Text><Text numberOfLines={2} style={styles.infoValue}>{value}</Text></View>; }
function ActionRow({ label, description, onPress, danger = false }: { label: string; description: string; onPress: () => void; danger?: boolean }) { return <Pressable onPress={onPress} style={styles.actionRow}><View style={styles.rowBody}><Text style={[styles.rowLabel, danger && styles.danger]}>{label}</Text><Text style={styles.rowDescription}>{description}</Text></View><Text style={styles.chevron}>›</Text></Pressable>; }
function ToggleRow({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (value: boolean) => void }) { return <View style={styles.actionRow}><View style={styles.rowBody}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowDescription}>{description}</Text></View><Switch onValueChange={onChange} thumbColor={colors.white} trackColor={{ false: '#c8ceca', true: '#95bc29' }} value={value} /></View>; }
function ChoiceCard({ label, description, selected = false, disabled = false, onPress }: { label: string; description: string; selected?: boolean; disabled?: boolean; onPress?: () => void }) { return <Pressable disabled={disabled || !onPress} onPress={onPress} style={[styles.choiceCard, selected && styles.choiceSelected, disabled && styles.choiceDisabled]}><View style={styles.rowBody}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowDescription}>{description}</Text></View><View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View></Pressable>; }
function ChoiceGroup({ values, selected, suffix = '', onSelect }: { values: Array<string | number>; selected: string | number; suffix?: string; onSelect: (value: string | number) => void }) { return <View style={styles.choiceGroup}>{values.map((value) => <Pressable key={value} onPress={() => onSelect(value)} style={[styles.choiceChip, selected === value && styles.choiceChipSelected]}><Text style={[styles.choiceChipText, selected === value && styles.choiceChipTextSelected]}>{`${String(value)[0].toUpperCase()}${String(value).slice(1)}${suffix}`}</Text></Pressable>)}</View>; }

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.paper, flex: 1 }, content: { padding: 22, paddingBottom: 45 }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 }, back: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 }, backText: { color: colors.ink, fontSize: 34, lineHeight: 36 }, title: { color: colors.ink, fontSize: 19, fontWeight: '700' }, headerSpacer: { width: 40 },
  sectionLabel: { color: '#769321', fontSize: 10, fontWeight: '800', letterSpacing: 1.3, marginBottom: 9, marginTop: 17 }, infoCard: { backgroundColor: colors.white, borderColor: colors.line, borderRadius: 14, borderWidth: 1, marginBottom: 9, padding: 15 }, infoValue: { color: colors.muted, fontSize: 11, marginTop: 5 }, actionRow: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.line, borderRadius: 14, borderWidth: 1, flexDirection: 'row', marginBottom: 9, minHeight: 72, padding: 14 }, rowBody: { flex: 1, paddingRight: 10 }, rowLabel: { color: colors.ink, fontSize: 14, fontWeight: '700' }, rowDescription: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 4 }, chevron: { color: '#9ba39e', fontSize: 25 }, danger: { color: colors.danger },
  choiceCard: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.line, borderRadius: 14, borderWidth: 1, flexDirection: 'row', marginBottom: 9, minHeight: 68, padding: 14 }, choiceSelected: { backgroundColor: '#eff8d8', borderColor: '#a8d42d' }, choiceDisabled: { opacity: 0.55 }, radio: { alignItems: 'center', borderColor: '#a9b1ab', borderRadius: 11, borderWidth: 1, height: 22, justifyContent: 'center', width: 22 }, radioSelected: { borderColor: '#7f9f26', borderWidth: 2 }, radioDot: { backgroundColor: '#7f9f26', borderRadius: 5, height: 10, width: 10 }, choiceGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }, choiceChip: { backgroundColor: colors.white, borderColor: colors.line, borderRadius: 18, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 }, choiceChipSelected: { backgroundColor: colors.lime, borderColor: '#9bc322' }, choiceChipText: { color: colors.muted, fontSize: 12, fontWeight: '600' }, choiceChipTextSelected: { color: colors.navy, fontWeight: '800' },
  loader: { marginTop: 45 }, saving: { marginTop: 15 }, message: { color: '#56701d', fontSize: 12, lineHeight: 17, marginTop: 14 }, error: { color: colors.danger, fontSize: 12, lineHeight: 17, marginTop: 14 },
});
