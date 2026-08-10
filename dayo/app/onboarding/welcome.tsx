import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { DayoButton } from '../../components/DayoButton';
import { DayoLogo } from '../../components/DayoLogo';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors } from '../../constants/theme';

export default function WelcomeScreen() {
  return (
    <ScreenContainer dark>
      <View style={styles.center}>
        <DayoLogo />
        <Text style={styles.wordmark}>DAYO</Text>
        <Text style={styles.tagline}>Take control of your day.</Text>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.copy}>Let’s learn what helps you work at your best.</Text>
        <DayoButton onPress={() => router.push('/onboarding/obstacles')} variant="lime">Get started</DayoButton>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  wordmark: { color: colors.cream, fontSize: 35, fontWeight: '700', letterSpacing: 12, marginLeft: 12, marginTop: 20 },
  tagline: { color: colors.white, fontSize: 14, marginTop: 9 },
  bottom: { paddingBottom: 10 },
  copy: { color: colors.mutedLight, fontSize: 13, lineHeight: 19, marginBottom: 16, textAlign: 'center' },
});
