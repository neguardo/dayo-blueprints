import 'react-native-url-polyfill/auto';
import 'expo-sqlite/localStorage/install';

import { AppState, Platform } from 'react-native';
import { createClient, processLock } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
  );
}

const parsedSupabaseUrl = new URL(supabaseUrl);
if (
  parsedSupabaseUrl.protocol !== 'https:' ||
  !parsedSupabaseUrl.hostname.endsWith('.supabase.co')
) {
  throw new Error(
    'EXPO_PUBLIC_SUPABASE_URL must be the HTTPS Project URL from Supabase settings.',
  );
}

// Supabase's client appends /auth/v1 and /rest/v1 itself. Accept a pasted API
// endpoint but normalize it to the project root so requests cannot contain a
// duplicated path such as /rest/v1/auth/v1/signup.
const supabaseProjectUrl = parsedSupabaseUrl.origin;

export const supabase = createClient(supabaseProjectUrl, supabaseKey, {
  auth: {
    storage: globalThis.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
