import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../constants/theme';

const suggestions = ['Plan my afternoon', 'I’m behind today', 'I can’t get started'];

export default function DayoScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ from: 'user' | 'dayo'; text: string }>>([]);

  function send(seed?: string) {
    const text = (seed ?? input).trim();
    if (!text) return;
    setMessages((current) => [...current, { from: 'user', text }, { from: 'dayo', text: 'I hear you. I’ll help you turn that into one calm, realistic next step.' }]);
    setInput('');
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90} style={styles.flex}>
        <View style={styles.header}><View style={styles.spark}><Text style={styles.sparkText}>✦</Text></View><Text style={styles.title}>DAYO</Text><Text style={styles.copy}>How can I help you today?</Text></View>
        <ScrollView contentContainerStyle={styles.messages} keyboardShouldPersistTaps="handled">
          {messages.length === 0 ? <View><Text style={styles.try}>TRY ASKING</Text>{suggestions.map((suggestion) => <Pressable key={suggestion} onPress={() => send(suggestion)} style={styles.pill}><Text style={styles.pillText}>{suggestion}</Text></Pressable>)}</View> : null}
          {messages.map((message, index) => <View key={`${message.from}-${index}`} style={[styles.bubble, message.from === 'user' ? styles.userBubble : styles.dayoBubble]}><Text style={[styles.bubbleText, message.from === 'user' && styles.userText]}>{message.text}</Text></View>)}
        </ScrollView>
        <View style={styles.inputRow}><TextInput multiline onChangeText={setInput} placeholder="Tell DAYO anything…" placeholderTextColor="#7c8588" style={styles.input} value={input} /><Pressable onPress={() => send()} style={styles.send}><Text style={styles.sendText}>↑</Text></Pressable></View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.paper, flex: 1 }, flex: { flex: 1 },
  header: { alignItems: 'center', paddingHorizontal: 22, paddingTop: 16 }, spark: { alignItems: 'center', backgroundColor: colors.navy, borderRadius: 24, height: 48, justifyContent: 'center', width: 48 }, sparkText: { color: colors.lime, fontSize: 22 },
  title: { color: colors.ink, fontSize: 23, fontWeight: '800', letterSpacing: 2, marginTop: 14 }, copy: { color: colors.muted, fontSize: 13, marginTop: 6 },
  messages: { flexGrow: 1, justifyContent: 'flex-end', padding: 22 }, try: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.4, marginBottom: 10 },
  pill: { alignSelf: 'flex-start', backgroundColor: colors.white, borderColor: colors.line, borderRadius: 18, borderWidth: 1, marginBottom: 8, paddingHorizontal: 14, paddingVertical: 10 }, pillText: { color: colors.ink, fontSize: 13 },
  bubble: { borderRadius: 15, marginBottom: 10, maxWidth: '86%', padding: 13 }, dayoBubble: { alignSelf: 'flex-start', backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1 }, userBubble: { alignSelf: 'flex-end', backgroundColor: colors.navy }, bubbleText: { color: colors.ink, fontSize: 13, lineHeight: 19 }, userText: { color: colors.white },
  inputRow: { alignItems: 'flex-end', backgroundColor: colors.white, borderColor: colors.line, borderRadius: 16, borderWidth: 1, flexDirection: 'row', margin: 16, padding: 6, paddingLeft: 14 }, input: { color: colors.ink, flex: 1, maxHeight: 90, minHeight: 42, paddingTop: 11 }, send: { alignItems: 'center', backgroundColor: colors.lime, borderRadius: 21, height: 42, justifyContent: 'center', width: 42 }, sendText: { color: colors.navy, fontSize: 22, fontWeight: '700' },
});
