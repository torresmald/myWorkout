import nodemailer from 'nodemailer'
import type Mail from 'nodemailer/lib/mailer/index.js'

import { APP_NAME, getSmtpConfig } from '../constants/mail.constants.js'

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

function buildVerificationEmailContent(verificationUrl: string): Pick<Mail.Options, 'subject' | 'text' | 'html'> {
  const subject = `Verifica tu cuenta en ${APP_NAME}`

  const text = [
    `Gracias por registrarte en ${APP_NAME}.`,
    '',
    'Para activar tu cuenta, abre este enlace:',
    verificationUrl,
    '',
    'El enlace caduca en 24 horas.',
    '',
    `Si no creaste esta cuenta, puedes ignorar este email.`,
  ].join('\n')

  const html = `
    <p>Gracias por registrarte en <strong>${APP_NAME}</strong>.</p>
    <p>Para activar tu cuenta, haz clic en el siguiente enlace:</p>
    <p><a href="${verificationUrl}">Verificar mi cuenta</a></p>
    <p>El enlace caduca en 24 horas.</p>
    <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
  `.trim()

  return { subject, text, html }
}

function buildPasswordResetEmailContent(resetUrl: string): Pick<Mail.Options, 'subject' | 'text' | 'html'> {
  const subject = `Restablece tu contraseña en ${APP_NAME}`

  const text = [
    `Recibimos una solicitud para restablecer tu contraseña en ${APP_NAME}.`,
    '',
    'Para elegir una nueva contraseña, abre este enlace:',
    resetUrl,
    '',
    'El enlace caduca en 1 hora.',
    '',
    'Si no solicitaste este cambio, puedes ignorar este email.',
  ].join('\n')

  const html = `
    <p>Recibimos una solicitud para restablecer tu contraseña en <strong>${APP_NAME}</strong>.</p>
    <p>Para elegir una nueva contraseña, haz clic en el siguiente enlace:</p>
    <p><a href="${resetUrl}">Restablecer contraseña</a></p>
    <p>El enlace caduca en 1 hora.</p>
    <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
  `.trim()

  return { subject, text, html }
}

export async function sendVerificationEmail(to: string, verificationUrl: string): Promise<void> {
  const config = getSmtpConfig()
  const content = buildVerificationEmailContent(verificationUrl)

  await getTransporter().sendMail({
    from: config.from,
    to,
    ...content,
  })
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const config = getSmtpConfig()
  const content = buildPasswordResetEmailContent(resetUrl)

  await getTransporter().sendMail({
    from: config.from,
    to,
    ...content,
  })
}
