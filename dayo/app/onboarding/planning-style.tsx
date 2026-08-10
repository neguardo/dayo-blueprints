import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { DayoButton } from '../../components/DayoButton';
import { OnboardingHeader } from '../../components/OnboardingHeader';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SelectionCard } from '../../components/SelectionCard';
import { colors } from '../../constants/theme';
import type { PlanningStyle } from '../../context/OnboardingContext';
import { useOnboarding } from '../../context/OnboardingContext';

const stylesList: Array<{ value: PlanningStyle; title: string; description: string }> = [
  { value: 'automatic', title: 'Plan everything for me', description: 'DAYO creates your whole day.' },
  { value: 'suggest', title: 'Suggest a plan', description: 'DAYO suggests, you decide.' },
  { value: 'manual', title: 'Mostly let me plan', description: "You're in control." },
];

export default function PlanningStyleScreen() {
  const { data, update } = useOnboarding();
  return (
    <ScreenContainer>
      <OnboardingHeader step={3} />
      <View style={styles.intro}>
        <Text style={styles.title}>How should DAYO help you plan?</Text>
        <Text style={styles.copy}>You can change this anytime.</Text>
      </View>
      <View style={styles.options}>
        {stylesList.map((option) => (
          <SelectionCard description={option.description} key={option.value} onPress={() => update({ planningStyle: option.value })} selected={data.planningStyle === option.value} title={option.title} />
        ))}
      </View>
      <View style={styles.bottom}>
        <DayoButton disabled={!data.planningStyle} onPress={() => router.push('/onboarding/first-task')}>Continue</DayoButton>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: { alignItems: 'center', marginTop: 48 },
  title: { color: colors.ink, fontSize: 26, fontWeight: '700', lineHeight: 33, maxWidth: 310, textAlign: 'center' },
  copy: { color: colors.muted, fontSize: 14, marginTop: 9 },
  options: { gap: 11, marginTop: 42 },
  bottom: { marginTop: 'auto', paddingTop: 20 },
});
