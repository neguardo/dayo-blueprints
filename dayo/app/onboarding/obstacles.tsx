import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { DayoButton } from '../../components/DayoButton';
import { OnboardingHeader } from '../../components/OnboardingHeader';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SelectionCard } from '../../components/SelectionCard';
import { colors } from '../../constants/theme';
import { useOnboarding } from '../../context/OnboardingContext';

const choices = ['I procrastinate', 'I get overwhelmed', "I don't know what to prioritize", 'I forget things'];

export default function ObstaclesScreen() {
  const { data, update } = useOnboarding();
  return (
    <ScreenContainer>
      <OnboardingHeader step={1} />
      <View style={styles.intro}>
        <Text style={styles.title}>What gets in your way?</Text>
        <Text style={styles.copy}>This helps DAYO support you better.</Text>
      </View>
      <View style={styles.options}>
        {choices.map((choice) => (
          <SelectionCard key={choice} onPress={() => update({ obstacle: choice })} selected={data.obstacle === choice} title={choice} />
        ))}
      </View>
      <View style={styles.bottom}>
        <DayoButton disabled={!data.obstacle} onPress={() => router.push('/onboarding/rhythm')}>Continue</DayoButton>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: { alignItems: 'center', marginTop: 40 },
  title: { color: colors.ink, fontSize: 26, fontWeight: '700', textAlign: 'center' },
  copy: { color: colors.muted, fontSize: 14, marginTop: 9 },
  options: { gap: 10, marginTop: 35 },
  bottom: { marginTop: 'auto', paddingTop: 18 },
});
