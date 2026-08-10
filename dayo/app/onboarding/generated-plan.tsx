import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DayoButton } from '../../components/DayoButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors } from '../../constants/theme';
import { useOnboarding } from '../../context/OnboardingContext';
import { useSession } from '../../context/SessionContext';
import { completeOnboarding } from '../../features/profile/profileService';

export default function GeneratedPlanScreen() {
  const { data, reset } = useOnboarding();
  const { refreshProfile } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const sessionLength = Math.min(45, data.estimatedMinutes);
  const sessions = Math.max(1, Math.ceil(data.estimatedMinutes / sessionLength));

  async function approve() {
    setLoading(true);
    setError('');
    try {
      await completeOnboarding({
        wakeTime: data.wakeTime,
        sleepTime: data.sleepTime,
        productivityPeriod: data.productivityPeriod,
      });
      await refreshProfile();
      reset();
      router.replace('/(tabs)');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save your onboarding.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <View style={styles.spark}><Text style={styles.sparkText}>✦</Text></View>
      <Text style={styles.title}>Here’s your first plan.</Text>
      <Text style={styles.copy}>DAYO created a calm starting point for you.</Text>
      <Text style={styles.eyebrow}>TODAY</Text>
      <View style={styles.planCard}>
        {Array.from({ length: Math.min(sessions, 4) }, (_, index) => {
          const minutes = Math.min(sessionLength, data.estimatedMinutes - index * sessionLength);
          const hour = 10 + index * 2;
          return (
            <View key={index} style={[styles.planRow, index > 0 && styles.planRowBorder]}>
              <View style={styles.planIcon}><Text style={styles.planIconText}>{index === 0 ? '✦' : '◷'}</Text></View>
              <View style={styles.planBody}>
                <Text style={styles.planTitle}>{data.firstTask || 'Your first task'}</Text>
                <Text style={styles.planTime}>{hour}:00 – {hour}:{String(minutes).padStart(2, '0')}</Text>
              </View>
              <Text style={styles.duration}>{minutes}m</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.approval}>
        <Text style={styles.approvalTitle}>Looks good?</Text>
        <Text style={styles.approvalCopy}>You can adjust anything later.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <DayoButton loading={loading} onPress={() => void approve()} variant="lime">Looks good</DayoButton>
        <DayoButton onPress={() => router.back()} variant="text">I want to adjust</DayoButton>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  spark: { alignItems: 'center', alignSelf: 'center', backgroundColor: colors.navy, borderRadius: 26, height: 52, justifyContent: 'center', marginTop: 14, width: 52 },
  sparkText: { color: colors.lime, fontSize: 25 },
  title: { color: colors.ink, fontSize: 27, fontWeight: '700', marginTop: 20, textAlign: 'center' },
  copy: { color: colors.muted, fontSize: 14, marginTop: 8, textAlign: 'center' },
  eyebrow: { color: colors.ink, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 10, marginTop: 36 },
  planCard: { backgroundColor: colors.white, borderColor: colors.line, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  planRow: { alignItems: 'center', flexDirection: 'row', minHeight: 72, padding: 13 },
  planRowBorder: { borderTopColor: colors.line, borderTopWidth: 1 },
  planIcon: { alignItems: 'center', backgroundColor: '#eff6dc', borderRadius: 18, height: 36, justifyContent: 'center', marginRight: 11, width: 36 },
  planIconText: { color: '#87ad22', fontSize: 16 },
  planBody: { flex: 1 },
  planTitle: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  planTime: { color: colors.muted, fontSize: 11, marginTop: 4 },
  duration: { color: colors.muted, fontSize: 12 },
  approval: { marginTop: 34 },
  approvalTitle: { color: colors.ink, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  approvalCopy: { color: colors.muted, fontSize: 12, marginBottom: 18, marginTop: 5, textAlign: 'center' },
  error: { color: colors.danger, fontSize: 13, marginBottom: 12, textAlign: 'center' },
});
