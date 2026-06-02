import nodemailer from 'nodemailer'
import type Mail from 'nodemailer/lib/mailer/index.js'

import type { AppLocale } from '../constants/locale.constants.js'
import { APP_NAME, getSmtpConfig } from '../constants/mail.constants.js'
import { formatEmailTemplate, getEmailTemplate } from '../locales/email-templates.js'

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const config = getSmtpConfig()

    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    })
  }

  return transporter
}

function buildVerificationEmailContent(
  verificationUrl: string,
  locale: AppLocale,
): Pick<Mail.Options, 'subject' | 'text' | 'html'> {
  const template = getEmailTemplate(locale)
  const subject = formatEmailTemplate(locale, 'verificationSubject', APP_NAME)

  const text = [
    formatEmailTemplate(locale, 'verificationIntro', APP_NAME),
    '',
    template.verificationInstruction,
    verificationUrl,
    '',
    template.verificationExpiry,
    '',
    template.verificationIgnore,
  ].join('\n')

  const html = `
    <p>${formatEmailTemplate(locale, 'verificationIntro', APP_NAME)}</p>
    <p>${template.verificationInstruction}</p>
    <p><a href="${verificationUrl}">${template.verificationLinkLabel}</a></p>
    <p>${template.verificationExpiry}</p>
    <p>${template.verificationIgnore}</p>
  `.trim()

  return { subject, text, html }
}

function buildPasswordResetEmailContent(
  resetUrl: string,
  locale: AppLocale,
): Pick<Mail.Options, 'subject' | 'text' | 'html'> {
  const template = getEmailTemplate(locale)
  const subject = formatEmailTemplate(locale, 'resetSubject', APP_NAME)

  const text = [
    formatEmailTemplate(locale, 'resetIntro', APP_NAME),
    '',
    template.resetInstruction,
    resetUrl,
    '',
    template.resetExpiry,
    '',
    template.resetIgnore,
  ].join('\n')

  const html = `
    <p>${formatEmailTemplate(locale, 'resetIntro', APP_NAME)}</p>
    <p>${template.resetInstruction}</p>
    <p><a href="${resetUrl}">${template.resetLinkLabel}</a></p>
    <p>${template.resetExpiry}</p>
    <p>${template.resetIgnore}</p>
  `.trim()

  return { subject, text, html }
}

export async function sendVerificationEmail(
  to: string,
  verificationUrl: string,
  locale: AppLocale,
): Promise<void> {
  const config = getSmtpConfig()
  const content = buildVerificationEmailContent(verificationUrl, locale)

  await getTransporter().sendMail({
    from: config.from,
    to,
    ...content,
  })
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  locale: AppLocale,
): Promise<void> {
  const config = getSmtpConfig()
  const content = buildPasswordResetEmailContent(resetUrl, locale)

  await getTransporter().sendMail({
    from: config.from,
    to,
    ...content,
  })
}

function buildWorkoutReminderEmailContent(
  workoutsUrl: string,
  locale: AppLocale,
  userName: string | null,
): Pick<Mail.Options, 'subject' | 'text' | 'html'> {
  const template = getEmailTemplate(locale)
  const subject = formatEmailTemplate(locale, 'reminderSubject', APP_NAME)
  const greetingName = userName?.trim() ? ` ${userName.trim()}` : ''

  const text = [
    formatEmailTemplate(locale, 'reminderIntro', APP_NAME).replace('{userName}', greetingName),
    '',
    template.reminderBody,
    '',
    workoutsUrl,
    '',
    template.reminderIgnore,
  ].join('\n')

  const html = `
    <p>${formatEmailTemplate(locale, 'reminderIntro', APP_NAME).replace('{userName}', greetingName)}</p>
    <p>${template.reminderBody}</p>
    <p><a href="${workoutsUrl}">${template.reminderLinkLabel}</a></p>
    <p>${template.reminderIgnore}</p>
  `.trim()

  return { subject, text, html }
}

export async function sendWorkoutReminderEmail(
  to: string,
  userName: string | null,
  workoutsUrl: string,
  locale: AppLocale,
): Promise<void> {
  const config = getSmtpConfig()
  const content = buildWorkoutReminderEmailContent(workoutsUrl, locale, userName)

  await getTransporter().sendMail({
    from: config.from,
    to,
    ...content,
  })
}
