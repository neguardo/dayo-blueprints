import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../constants/theme';

const sections = [
  ['1. Scope', 'This Privacy Policy explains how DAYO handles personal information when you create an account and use its planning, calendar, focus and progress features.'],
  ['2. Information we collect', 'DAYO stores your account identifier, email address, display name, profile preferences, tasks, calendar items, focus results and planning settings. Technical providers may also process device, network and diagnostic information required to operate and secure the service.'],
  ['3. How information is used', 'We use information to authenticate you, display your schedule, save preferences, prevent calendar conflicts, calculate progress, improve reliability and protect DAYO against misuse. We do not use task content for advertising.'],
  ['4. Legal basis and consent', 'Information is processed to provide the service you request, protect legitimate security interests and comply with applicable law. Where consent is required, you may withdraw it through the relevant setting or by contacting DAYO.'],
  ['5. Storage and service providers', 'Account and planning data is stored using Supabase infrastructure. Data may be processed in regions used by DAYO and its service providers, subject to appropriate contractual and security safeguards.'],
  ['6. Sharing', 'DAYO does not sell personal information. Information is shared only with infrastructure providers that help operate the app, when you direct us to share it, or when disclosure is legally required.'],
  ['7. Security', 'DAYO uses authenticated access and database Row Level Security so users can access only their own records. No online service can guarantee absolute security; protect your password and report suspected unauthorized access.'],
  ['8. Retention and deletion', 'Data is retained while your account is active and as needed to operate the service or meet legal obligations. Deleted tasks are removed from active app data. Account deletion and complete export tools may be added before public release; until then, contact DAYO for a deletion or access request.'],
  ['9. Your rights', 'Depending on your location, you may request access, correction, deletion, restriction, portability or objection to processing. You may also complain to your local data protection authority.'],
  ['10. Children', 'DAYO is not intended for children who are below the minimum age required to consent to online services in their country. We do not knowingly collect their personal information.'],
  ['11. Changes', 'We may update this policy when DAYO features or legal requirements change. Material changes will be communicated in the app or through another appropriate channel.'],
  ['12. Contact', 'For privacy questions or requests, use the official DAYO support contact published with the production release. Do not include passwords or sensitive task content in a support request.'],
];

export default function PrivacyPolicyScreen() {
  return <PolicyPage title="Privacy Policy" intro="Effective August 22, 2026" sections={sections} />;
}

export function PolicyPage({ title, intro, sections: contentSections }: { title: string; intro: string; sections: string[][] }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Pressable hitSlop={12} onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.title}>{title}</Text><View style={styles.spacer} /></View>
        <Text style={styles.intro}>{intro}</Text>
        {contentSections.map(([heading, body]) => <View key={heading} style={styles.section}><Text style={styles.heading}>{heading}</Text><Text style={styles.body}>{body}</Text></View>)}
        <Text style={styles.notice}>This in-app policy is product information and should be reviewed by qualified legal counsel before DAYO is publicly released.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.paper, flex: 1 }, content: { padding: 22, paddingBottom: 50 }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }, back: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 }, backText: { color: colors.ink, fontSize: 34, lineHeight: 36 }, title: { color: colors.ink, fontSize: 20, fontWeight: '800' }, spacer: { width: 40 }, intro: { color: '#789527', fontSize: 11, fontWeight: '800', letterSpacing: 0.7, marginBottom: 12 }, section: { backgroundColor: colors.white, borderColor: colors.line, borderRadius: 14, borderWidth: 1, marginTop: 10, padding: 16 }, heading: { color: colors.ink, fontSize: 15, fontWeight: '800' }, body: { color: '#56616a', fontSize: 12, lineHeight: 19, marginTop: 8 }, notice: { color: colors.muted, fontSize: 10, lineHeight: 16, marginTop: 18, textAlign: 'center' },
});
