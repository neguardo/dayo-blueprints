import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DayoLogo } from '../components/DayoLogo';
import { colors } from '../constants/theme';
import { OnboardingProvider } from '../context/OnboardingContext';
import { SessionProvider, useSession } from '../context/SessionContext';

function RootNavigator() {
  const { session, loading, onboardingCompleted } = useSession();

  if (loading) {
    return (
      <View style={styles.loading}>
        <DayoLogo />
        <Text style={styles.wordmark}>DAYO</Text>
        <ActivityIndicator color={colors.lime} style={styles.loader} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session) && !onboardingCompleted}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session) && onboardingCompleted}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="focus" options={{ animation: 'fade' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <OnboardingProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </OnboardingProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', backgroundColor: colors.navy, flex: 1, justifyContent: 'center' },
  wordmark: { color: colors.cream, fontSize: 26, fontWeight: '700', letterSpacing: 9, marginLeft: 9, marginTop: 16 },
  loader: { marginTop: 30 },
});
