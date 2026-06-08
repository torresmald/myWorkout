import type { AppLocale } from '../constants/locale.constants.js'

interface EmailTemplate {
  verificationSubject: string
  verificationIntro: string
  verificationInstruction: string
  verificationLinkLabel: string
  verificationExpiry: string
  verificationIgnore: string
  resetSubject: string
  resetIntro: string
  resetInstruction: string
  resetLinkLabel: string
  resetExpiry: string
  resetIgnore: string
  reminderSubject: string
  reminderIntro: string
  reminderBody: string
  reminderLinkLabel: string
  reminderIgnore: string
  plannedReminderSubject: string
  plannedReminderBody: string
}

const templates: Record<AppLocale, EmailTemplate> = {
  es: {
    verificationSubject: 'Verifica tu cuenta en {appName}',
    verificationIntro: 'Gracias por registrarte en {appName}.',
    verificationInstruction: 'Para activar tu cuenta, abre este enlace:',
    verificationLinkLabel: 'Verificar mi cuenta',
    verificationExpiry: 'El enlace caduca en 24 horas.',
    verificationIgnore: 'Si no creaste esta cuenta, puedes ignorar este email.',
    resetSubject: 'Restablece tu contraseña en {appName}',
    resetIntro: 'Recibimos una solicitud para restablecer tu contraseña en {appName}.',
    resetInstruction: 'Para elegir una nueva contraseña, abre este enlace:',
    resetLinkLabel: 'Restablecer contraseña',
    resetExpiry: 'El enlace caduca en 1 hora.',
    resetIgnore: 'Si no solicitaste este cambio, puedes ignorar este email.',
    reminderSubject: 'Hora de entrenar en {appName}',
    reminderIntro: 'Hola{userName},',
    reminderBody:
      'Llevás más de una semana sin registrar un entrenamiento. ¿Te apetece retomar la rutina hoy?',
    reminderLinkLabel: 'Ir a mis entrenamientos',
    reminderIgnore: 'Puedes desactivar estos recordatorios en tu perfil.',
    plannedReminderSubject: 'Tienes un entreno planificado hoy en {appName}',
    plannedReminderBody:
      'Hoy tienes un entrenamiento planificado en myWorkout. ¿Lo empezamos?',
  },
  en: {
    verificationSubject: 'Verify your {appName} account',
    verificationIntro: 'Thanks for signing up for {appName}.',
    verificationInstruction: 'To activate your account, open this link:',
    verificationLinkLabel: 'Verify my account',
    verificationExpiry: 'This link expires in 24 hours.',
    verificationIgnore: 'If you did not create this account, you can ignore this email.',
    resetSubject: 'Reset your {appName} password',
    resetIntro: 'We received a request to reset your {appName} password.',
    resetInstruction: 'To choose a new password, open this link:',
    resetLinkLabel: 'Reset password',
    resetExpiry: 'This link expires in 1 hour.',
    resetIgnore: 'If you did not request this change, you can ignore this email.',
    reminderSubject: 'Time to train on {appName}',
    reminderIntro: 'Hi{userName},',
    reminderBody:
      'You have not logged a workout in over a week. Ready to get back on track today?',
    reminderLinkLabel: 'Go to my workouts',
    reminderIgnore: 'You can turn off these reminders in your profile.',
    plannedReminderSubject: 'You have a planned workout today on {appName}',
    plannedReminderBody: 'You have a workout scheduled for today in myWorkout. Ready to start?',
  },
}

function applyAppName(template: string, appName: string): string {
  return template.replaceAll('{appName}', appName)
}

export function getEmailTemplate(locale: AppLocale): EmailTemplate {
  return templates[locale] ?? templates.es
}

export function formatEmailTemplate(
  locale: AppLocale,
  key: keyof EmailTemplate,
  appName: string,
): string {
  return applyAppName(getEmailTemplate(locale)[key], appName)
}
