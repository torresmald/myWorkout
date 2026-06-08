export default {
  banner: {
    title: 'Usamos almacenamiento local y cookies',
    description:
      'Utilizamos datos esenciales para que la app funcione y, solo si lo aceptas, analítica y servicios de terceros como Google Sign-In.',
    acceptAll: 'Aceptar todo',
    rejectNonEssential: 'Solo necesarias',
    customize: 'Personalizar',
    policyLink: 'Política de cookies',
  },
  preferences: {
    title: 'Preferencias de cookies',
    description: 'Elige qué categorías quieres permitir. Las esenciales son obligatorias para usar la app.',
    essential: {
      title: 'Esenciales',
      description: 'Sesión, seguridad y registro de tu elección de cookies.',
    },
    preferences: {
      title: 'Preferencias',
      description: 'Idioma, tema y ajustes de la interfaz.',
    },
    analytics: {
      title: 'Analítica',
      description: 'Errores y rendimiento anónimos con Sentry (si está configurado).',
    },
    thirdParty: {
      title: 'Terceros',
      description: 'Google Sign-In para iniciar sesión con tu cuenta de Google.',
    },
    alwaysOn: 'Siempre activas',
    save: 'Guardar preferencias',
  },
  policy: {
    title: 'Política de cookies',
    intro:
      'Esta app guarda datos en tu navegador para recordar tu sesión, preferencias y, si lo autorizas, analítica o servicios de terceros.',
    lastUpdated: 'Última actualización: mayo 2026',
    categoriesTitle: 'Categorías',
    inventoryTitle: 'Detalle de almacenamiento',
    table: {
      name: 'Nombre',
      type: 'Tipo',
      category: 'Categoría',
      duration: 'Duración',
      provider: 'Proveedor',
    },
    managePreferences: 'Gestionar preferencias',
    back: 'Volver',
  },
  categories: {
    essential: 'Esenciales',
    preferences: 'Preferencias',
    analytics: 'Analítica',
    thirdParty: 'Terceros',
  },
  storageTypes: {
    localStorage: 'Almacenamiento local',
    cookie: 'Cookie',
  },
  inventory: {
    session: 'Sesión (hasta cerrar sesión)',
    refreshSession: 'Renovación de sesión',
    consentRecord: '12 meses',
    persistent: 'Persistente',
    guestLocale: 'Hasta iniciar sesión (preferencia en servidor tras login)',
    analyticsSession: 'Sesión / según Sentry',
    thirdPartySession: 'Según Google',
  },
  providers: {
    sentry: 'Sentry',
    google: 'Google',
  },
  google: {
    consentRequired:
      'Para usar Google Sign-In necesitas aceptar cookies de terceros en tus preferencias.',
    enableThirdParty: 'Activar cookies de terceros',
  },
  footer: {
    cookies: 'Cookies',
    preferences: 'Preferencias de cookies',
  },
} as const
