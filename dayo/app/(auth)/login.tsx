import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { DayoButton } from '../../components/DayoButton';
import { DayoLogo } from '../../components/DayoLogo';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function login() {
    setLoading(true);
    setError('');
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (signInError) setError(signInError.message);
    setLoading(false);
  }

  return (
    <ScreenContainer dark scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.layout}>
        <View style={styles.brand}>
          <DayoLogo />
          <Text style={styles.wordmark}>DAYO</Text>
          <Text style={styles.tagline}>Take control of your day.</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.copy}>Log in to continue with your day.</Text>
          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#71818e"
            style={styles.input}
            value={email}
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="current-password"
            onChangeText={setPassword}
            onSubmitEditing={() => void login()}
            placeholder="Your password"
            placeholderTextColor="#71818e"
            secureTextEntry
            style={styles.input}
            value={password}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <DayoButton
            disabled={!email.trim() || password.length < 6}
            loading={loading}
            onPress={() => void login()}
            variant="lime"
          >
            Log in
          </DayoButton>
          <View style={styles.switchRow}>
            <Text style={styles.switchCopy}>New to DAYO?</Text>
            <Link href="/(auth)/register" style={styles.link}>Create account</Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  layout: { flex: 1, justifyContent: 'center' },
  brand: { alignItems: 'center', marginBottom: 34 },
  wordmark: { color: colors.cream, fontSize: 29, fontWeight: '700', letterSpacing: 10, marginLeft: 10, marginTop: 15 },
  tagline: { color: colors.mutedLight, fontSize: 13, marginTop: 7 },
  card: { backgroundColor: colors.navyLight, borderColor: colors.darkLine, borderRadius: 22, borderWidth: 1, padding: 21 },
  title: { color: colors.white, fontSize: 25, fontWeight: '700' },
  copy: { color: colors.mutedLight, fontSize: 14, marginBottom: 24, marginTop: 7 },
  label: { color: '#c5cfd7', fontSize: 12, fontWeight: '600', marginBottom: 7 },
  input: { backgroundColor: colors.navy, borderColor: colors.darkLine, borderRadius: 12, borderWidth: 1, color: colors.white, fontSize: 16, marginBottom: 15, padding: 14 },
  error: { color: '#ff9999', fontSize: 13, marginBottom: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 21 },
  switchCopy: { color: colors.mutedLight, fontSize: 14 },
  link: { color: colors.lime, fontSize: 14, fontWeight: '700', marginLeft: 6 },
});
