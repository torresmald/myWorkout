import { EMAIL_REGEX, EMAIL_VERIFICATION_TOKEN_TTL_MS, RESEND_VERIFICATION_SUCCESS_MESSAGE } from '../constants/auth.constants.js'
import { isMailConfigured } from '../constants/mail.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import { normalizeEmail } from '../utils/auth.util.js'
import { generateVerificationToken, hashToken } from '../utils/token.util.js'
import { sendVerificationEmail } from './mail.service.js'

export function hashVerificationToken(token: string): string {
  return hashToken(token)
}

export function buildVerificationUrl(token: string): string {
  const appUrl = process.env.APP_URL ?? 'http://localhost:5173'
  return `${appUrl}/verify-email?token=${encodeURIComponent(token)}`
}

export function logVerificationUrlInDev(token: string): void {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  console.log(`[dev] Email verification URL: ${buildVerificationUrl(token)}`)
}

export async function createEmailVerificationToken(userId: number): Promise<string> {
  await prisma.emailVerificationToken.deleteMany({
    where: { userId },
  })

  const token = generateVerificationToken()
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS)

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash: hashVerificationToken(token),
      expiresAt,
    },
  })

  return token
}

export async function verifyEmailWithToken(token: string): Promise<{ message: string }> {
  const trimmedToken = token.trim()

  if (!trimmedToken) {
    throw new AppError('Token de verificación inválido', 400)
  }

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashVerificationToken(trimmedToken) },
    include: { user: true },
  })

  if (!verificationToken) {
    throw new AppError('Token de verificación inválido o expirado', 400)
  }

  if (verificationToken.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    })
    throw new AppError('Token de verificación expirado', 400)
  }

  if (verificationToken.user.emailVerifiedAt) {
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: verificationToken.userId },
    })
    return { message: 'La cuenta ya estaba verificada' }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.deleteMany({
      where: { userId: verificationToken.userId },
    }),
  ])

  return { message: 'Cuenta verificada correctamente' }
}

export async function resendVerificationEmail(email: string): Promise<{ message: string }> {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
    throw new AppError('Email inválido', 400)
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  if (!user || !user.password || user.emailVerifiedAt) {
    return { message: RESEND_VERIFICATION_SUCCESS_MESSAGE }
  }

  const token = await createEmailVerificationToken(user.id)
  await sendUserVerificationEmail(normalizedEmail, token)

  return { message: RESEND_VERIFICATION_SUCCESS_MESSAGE }
}

export async function sendUserVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = buildVerificationUrl(token)

  if (!isMailConfigured()) {
    logVerificationUrlInDev(token)
    return
  }

  try {
    await sendVerificationEmail(email, verificationUrl)
  } catch (error) {
    console.error('Failed to send verification email:', error)
    throw new AppError('No se pudo enviar el email de verificación', 500)
  }
}
