import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/theme';

const symbols: Record<string, string> = { index: '⌂', plan: '□', dayo: '✦', progress: '↗' };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: '#7c858b',
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.bar,
        tabBarIcon: ({ color, focused }) =>
          route.name === 'dayo' ? (
            <View style={styles.dayoButton}><Text style={styles.dayoSymbol}>✦</Text></View>
          ) : (
            <Text style={[styles.symbol, { color }, focused && styles.symbolActive]}>{symbols[route.name]}</Text>
          ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="plan" options={{ title: 'Plan' }} />
      <Tabs.Screen name="dayo" options={{ title: 'DAYO' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.white, borderTopColor: colors.line, height: Platform.select({ ios: 88, android: 68 }), paddingBottom: Platform.select({ ios: 24, android: 8 }), paddingTop: 7 },
  label: { fontSize: 10, fontWeight: '600' },
  symbol: { fontSize: 22, fontWeight: '500' },
  symbolActive: { fontWeight: '800' },
  dayoButton: { alignItems: 'center', backgroundColor: colors.navy, borderColor: colors.white, borderRadius: 25, borderWidth: 4, height: 50, justifyContent: 'center', marginTop: -20, shadowColor: '#061526', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 7, width: 50 },
  dayoSymbol: { color: colors.lime, fontSize: 20 },
});
