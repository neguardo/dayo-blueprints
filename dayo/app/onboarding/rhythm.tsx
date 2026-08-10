import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { DayoButton } from '../../components/DayoButton';
import { OnboardingHeader } from '../../components/OnboardingHeader';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SelectionCard } from '../../components/SelectionCard';
import { colors } from '../../constants/theme';
import { useOnboarding } from '../../context/OnboardingContext';
import type { ProductivityPeriod } from '../../types/database';

const periods: Array<{ value: ProductivityPeriod; title: string }> = [
  { value: 'morning', title: 'Morning' },
  { value: 'afternoon', title: 'Afternoon' },
  { value: 'evening', title: 'Evening' },
  { value: 'varies', title: 'It varies' },
];

export default function RhythmScreen() {
  const { data, update } = useOnboarding();
  const valid = /^([01]\d|2[0-3]):[0-5]\d$/.test(data.wakeTime) && /^([01]\d|2[0-3]):[0-5]\d$/.test(data.sleepTime);

  return (
    <ScreenContainer scroll>
      <OnboardingHeader step={2} />
      <View style={styles.intro}>
        <Text style={styles.title}>When does your day flow best?</Text>
        <Text style={styles.copy}>DAYO uses this to make plans that fit your energy.</Text>
      </View>
      <View style={styles.timeRow}>
        <View style={styles.timeGroup}>
          <Text style={styles.label}>Wake up</Text>
          <TextInput keyboardType="numbers-and-punctuation" maxLength={5} onChangeText={(wakeTime) => update({ wakeTime })} style={styles.timeInput} value={data.wakeTime} />
        </View>
        <View style={styles.timeGroup}>
          <Text style={styles.label}>Go to bed</Text>
          <TextInput keyboardType="numbers-and-punctuation" maxLength={5} onChangeText={(sleepTime) => update({ sleepTime })} style={styles.timeInput} value={data.sleepTime} />
        </View>
      </View>
      <Text style={styles.label}>Most productive</Text>
      <View style={styles.periods}>
        {periods.map((period) => (
          <SelectionCard key={period.value} onPress={() => update({ productivityPeriod: period.value })} selected={data.productivityPeriod === period.value} title={period.title} />
        ))}
      </View>
      <View style={styles.bottom}>
        <DayoButton disabled={!valid} onPress={() => router.push('/onboarding/planning-style')}>Continue</DayoButton>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: { alignItems: 'center', marginTop: 32 },
  title: { color: colors.ink, fontSize: 25, fontWeight: '700', lineHeight: 32, textAlign: 'center' },
  copy: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8, textAlign: 'center' },
  timeRow: { flexDirection: 'row', gap: 12, marginBottom: 28, marginTop: 30 },
  timeGroup: { flex: 1 },
  label: { color: colors.ink, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  timeInput: { backgroundColor: colors.white, borderColor: colors.line, borderRadius: 14, borderWidth: 1, color: colors.ink, fontSize: 24, padding: 15, textAlign: 'center' },
  periods: { gap: 9 },
  bottom: { marginTop: 22 },
});
