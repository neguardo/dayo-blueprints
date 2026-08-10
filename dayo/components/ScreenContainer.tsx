import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../constants/theme';

export function ScreenContainer({
  children,
  dark = false,
  scroll = false,
}: {
  children: ReactNode;
  dark?: boolean;
  scroll?: boolean;
}) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safe, dark && styles.dark]} edges={['top', 'left', 'right']}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  dark: { backgroundColor: colors.navy },
  content: { flex: 1, padding: spacing.screen },
  scrollContent: { flexGrow: 1, padding: spacing.screen, paddingBottom: 36 },
});
