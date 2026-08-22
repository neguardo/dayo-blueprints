import { PolicyPage } from './privacy-policy';

const sections = [
  ['1. What cookies are', 'Cookies are small text records a website can store in a browser. Mobile apps may use similar local storage technologies to keep a secure session and remember essential settings.'],
  ['2. DAYO’s current use', 'DAYO does not currently use advertising or cross-site tracking cookies. The browser version may use essential local storage to maintain your Supabase authentication session and keep you signed in.'],
  ['3. Essential storage', 'Essential storage supports login, account security, session recovery and core app operation. Blocking it may prevent account creation, login or saved planning data from working correctly.'],
  ['4. Analytics and diagnostics', 'DAYO does not currently enable optional advertising analytics in this project. If optional analytics or crash reporting is introduced, this policy and the consent controls will be updated before that data is collected where required.'],
  ['5. Third-party services', 'Supabase provides authentication and database services and may set or access technical session information necessary to deliver those services. Its handling of information is governed by its own policies and DAYO’s service agreement with that provider.'],
  ['6. Retention', 'Authentication records remain only as long as required for the session, security and account operation. Exact duration can depend on browser settings, logout behavior and the authentication provider’s token configuration.'],
  ['7. Your controls', 'You can clear site data through your browser settings or log out of DAYO. Clearing essential storage signs you out and may require you to authenticate again. Device-level controls may differ between Android, iOS and web.'],
  ['8. Future changes', 'If DAYO adds non-essential cookies, users will receive appropriate information and consent choices before those cookies are used when required by law.'],
  ['9. Contact', 'Questions about cookies or local storage can be sent through the official DAYO support contact published with the production release.'],
];

export default function CookiePolicyScreen() {
  return <PolicyPage title="Cookie Policy" intro="Effective August 22, 2026" sections={sections} />;
}
