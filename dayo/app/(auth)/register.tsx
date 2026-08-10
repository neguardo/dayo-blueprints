import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { DayoButton } from '../../components/DayoButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function register() {
    setLoading(true);
    setError('');
    setNotice('');
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { display_name: name.trim() || null } },
    });
    if (signUpError) setError(signUpError.message);
    else if (!data.session) setNotice('Check your inbox to confirm your email. Then return and log in.');
    setLoading(false);
  }

  return (
    <ScreenContainer dark scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.layout}>
        <Text style={styles.eyebrow}>WELCOME TO DAYO</Text>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.copy}>A calmer, more focused day starts here.</Text>
        <Text style={styles.label}>Name</Text>
        <TextInput autoCapitalize="words" autoComplete="name" onChangeText={setName} placeholder="Your name" placeholderTextColor="#71818e" style={styles.input} value={name} />
        <Text style={styles.label}>Email</Text>
        <TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#71818e" style={styles.input} value={email} />
        <Text style={styles.label}>Password</Text>
        <TextInput autoCapitalize="none" autoComplete="new-password" onChangeText={setPassword} placeholder="At least 6 characters" placeholderTextColor="#71818e" secureTextEntry style={styles.input} value={password} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <DayoButton disabled={!email.trim() || password.length < 6} loading={loading} onPress={() => void register()} variant="lime">Create account</DayoButton>
        <View style={styles.switchRow}>
          <Text style={styles.switchCopy}>Already have an account?</Text>
          <Link href="/(auth)/login" style={styles.link}>Log in</Link>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  layout: { flex: 1, justifyContent: 'center' },
  eyebrow: { color: colors.lime, fontSize: 11, fontWeight: '700', letterSpacing: 1.6, marginBottom: 9 },
  title: { color: colors.white, fontSize: 30, fontWeight: '700' },
  copy: { color: colors.mutedLight, fontSize: 14, marginBottom: 30, marginTop: 8 },
  label: { color: '#c5cfd7', fontSize: 12, fontWeight: '600', marginBottom: 7 },
  input: { backgroundColor: colors.navyLight, borderColor: colors.darkLine, borderRadius: 12, borderWidth: 1, color: colors.white, fontSize: 16, marginBottom: 15, padding: 14 },
  error: { color: '#ff9999', fontSize: 13, marginBottom: 12 },
  notice: { color: colors.lime, fontSize: 13, lineHeight: 19, marginBottom: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 21 },
  switchCopy: { color: colors.mutedLight, fontSize: 14 },
  link: { color: colors.lime, fontSize: 14, fontWeight: '700', marginLeft: 6 },
});
