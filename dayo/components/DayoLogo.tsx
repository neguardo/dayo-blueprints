import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';

export function DayoLogo({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.mark, compact && styles.markCompact]}>
      <Text style={[styles.letter, compact && styles.letterCompact]}>D</Text>
      <View style={[styles.sun, compact && styles.sunCompact]} />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    width: 82,
    height: 82,
    borderColor: colors.cream,
    borderWidth: 3,
    borderRadius: 20,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  markCompact: { width: 38, height: 38, borderRadius: 10, borderWidth: 2 },
  letter: { color: colors.cream, fontSize: 57, fontWeight: '300', lineHeight: 76, marginLeft: 6 },
  letterCompact: { fontSize: 27, lineHeight: 35, marginLeft: 3 },
  sun: {
    position: 'absolute',
    width: 45,
    height: 22,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.lime,
    bottom: 6,
    left: 18,
    borderColor: colors.cream,
    borderWidth: 2,
  },
  sunCompact: { width: 21, height: 10, bottom: 3, left: 8, borderWidth: 1 },
});
