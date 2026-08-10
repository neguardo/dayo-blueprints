import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../constants/theme';

export function DayoButton({
  children,
  onPress,
  disabled = false,
  loading = false,
  variant = 'dark',
}: {
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'dark' | 'lime' | 'text';
}) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        (pressed || disabled || loading) && styles.inactive,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'lime' ? colors.navy : colors.white} />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  dark: { backgroundColor: colors.navy },
  lime: { backgroundColor: colors.lime },
  text: { backgroundColor: 'transparent' },
  label: { fontSize: 15, fontWeight: '700' },
  darkLabel: { color: colors.white },
  limeLabel: { color: colors.navy },
  textLabel: { color: colors.navy },
  inactive: { opacity: 0.5 },
});
