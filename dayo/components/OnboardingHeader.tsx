import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';

export function OnboardingHeader({ step, total = 4 }: { step: number; total?: number }) {
  return (
    <View style={styles.header}>
      <Pressable hitSlop={12} onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>‹</Text>
      </Pressable>
      <View style={styles.track}>
        <View style={[styles.progress, { width: `${(step / total) * 100}%` }]} />
      </View>
      <Text style={styles.step}>{step}/{total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 40 },
  back: { alignItems: 'center', height: 36, justifyContent: 'center', width: 36 },
  backText: { color: colors.navy, fontSize: 32, fontWeight: '300', lineHeight: 34 },
  track: { backgroundColor: colors.line, borderRadius: 3, flex: 1, height: 5, overflow: 'hidden' },
  progress: { backgroundColor: colors.lime, borderRadius: 3, height: 5 },
  step: { color: colors.muted, fontSize: 11, width: 26 },
});
