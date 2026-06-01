export default {
  banner: {
    title: 'We use local storage and cookies',
    description:
      'We use essential data so the app works and, only if you accept, analytics and third-party services such as Google Sign-In.',
    acceptAll: 'Accept all',
    rejectNonEssential: 'Essential only',
    customize: 'Customize',
    policyLink: 'Cookie policy',
  },
  preferences: {
    title: 'Cookie preferences',
    description: 'Choose which categories to allow. Essential cookies are required to use the app.',
    essential: {
      title: 'Essential',
      description: 'Session, security and your cookie choice record.',
    },
    preferences: {
      title: 'Preferences',
      description: 'Language, theme and interface settings.',
    },
    analytics: {
      title: 'Analytics',
      description: 'Anonymous errors and performance with Sentry (when configured).',
    },
    thirdParty: {
      title: 'Third-party',
      description: 'Google Sign-In to sign in with your Google account.',
    },
    alwaysOn: 'Always on',
    save: 'Save preferences',
  },
  policy: {
    title: 'Cookie policy',
    intro:
      'This app stores data in your browser to remember your session, preferences and, if you authorize it, analytics or third-party services.',
    lastUpdated: 'Last updated: May 2026',
    categoriesTitle: 'Categories',
    inventoryTitle: 'Storage details',
    table: {
      name: 'Name',
      type: 'Type',
      category: 'Category',
      duration: 'Duration',
      provider: 'Provider',
    },
    managePreferences: 'Manage preferences',
    back: 'Back',
  },
  categories: {
    essential: 'Essential',
    preferences: 'Preferences',
    analytics: 'Analytics',
    thirdParty: 'Third-party',
  },
  storageTypes: {
    localStorage: 'Local storage',
    cookie: 'Cookie',
  },
  inventory: {
    session: 'Session (until sign out)',
    refreshSession: 'Session renewal',
    consentRecord: '12 months',
    persistent: 'Persistent',
    analyticsSession: 'Session / per Sentry',
    thirdPartySession: 'Per Google',
  },
  providers: {
    sentry: 'Sentry',
    google: 'Google',
  },
  google: {
    consentRequired: 'To use Google Sign-In you need to accept third-party cookies in your preferences.',
    enableThirdParty: 'Enable third-party cookies',
  },
  footer: {
    cookies: 'Cookies',
    preferences: 'Cookie preferences',
  },
} as const
