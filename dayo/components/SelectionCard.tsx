import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../constants/theme';

export function SelectionCard({
  title,
  description,
  selected,
  onPress,
}: {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, selected && styles.selected, pressed && styles.pressed]}
    >
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      <Text style={[styles.radio, selected && styles.radioSelected]}>{selected ? '✓' : ''}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 72, borderColor: colors.line, borderWidth: 1, borderRadius: 14, backgroundColor: colors.white, padding: 16, paddingRight: 50, justifyContent: 'center' },
  selected: { backgroundColor: colors.lime, borderColor: '#b4df43' },
  pressed: { transform: [{ scale: 0.985 }] },
  title: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  description: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  radio: { position: 'absolute', right: 16, top: 24, width: 24, height: 24, borderRadius: 12, borderColor: '#bcc3ba', borderWidth: 1, textAlign: 'center', lineHeight: 22, color: colors.navy, fontWeight: '800' },
  radioSelected: { backgroundColor: colors.white, borderColor: colors.white },
});
