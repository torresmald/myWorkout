import { ErrorCode, MessageCode } from '../constants/error-codes.constants.js'
import { EMAIL_REGEX, EMAIL_VERIFICATION_TOKEN_TTL_MS } from '../constants/auth.constants.js'
import type { AppLocale } from '../constants/locale.constants.js'
import { isMailConfigured } from '../constants/mail.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import { normalizeEmail } from '../utils/auth.util.js'
import { parseAppLocale } from '../utils/locale.util.js'
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

export async function verifyEmailWithToken(token: string): Promise<{ messageCode: string }> {
  const trimmedToken = token.trim()

  if (!trimmedToken) {
    throw new AppError(ErrorCode.INVALID_VERIFICATION_TOKEN, 400)
  }

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashVerificationToken(trimmedToken) },
    include: { user: true },
  })

  if (!verificationToken) {
    throw new AppError(ErrorCode.VERIFICATION_TOKEN_INVALID_OR_EXPIRED, 400)
  }

  if (verificationToken.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    })
    throw new AppError(ErrorCode.VERIFICATION_TOKEN_EXPIRED, 400)
  }

  if (verificationToken.user.emailVerifiedAt) {
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: verificationToken.userId },
    })
    return { messageCode: MessageCode.ACCOUNT_ALREADY_VERIFIED }
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

  return { messageCode: MessageCode.ACCOUNT_VERIFIED }
}

export async function resendVerificationEmail(
  email: string,
  locale?: string,
): Promise<{ messageCode: string }> {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
    throw new AppError(ErrorCode.INVALID_EMAIL, 400)
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { preferences: { select: { locale: true } } },
  })

  if (!user || !user.password || user.emailVerifiedAt) {
    return { messageCode: MessageCode.RESEND_VERIFICATION_SUCCESS }
  }

  const emailLocale = locale
    ? parseAppLocale(locale)
    : parseAppLocale(user.preferences?.locale ?? 'es')

  if (locale) {
    await prisma.userPreferences.upsert({
      where: { userId: user.id },
      create: { userId: user.id, locale: emailLocale },
      update: { locale: emailLocale },
    })
  }

  const token = await createEmailVerificationToken(user.id)
  await sendUserVerificationEmail(normalizedEmail, token, emailLocale)

  return { messageCode: MessageCode.RESEND_VERIFICATION_SUCCESS }
}

export async function sendUserVerificationEmail(
  email: string,
  token: string,
  locale: AppLocale,
): Promise<void> {
  const verificationUrl = buildVerificationUrl(token)

  if (!isMailConfigured()) {
    logVerificationUrlInDev(token)
    return
  }

  try {
    await sendVerificationEmail(email, verificationUrl, locale)
  } catch (error) {
    console.error('Failed to send verification email:', error)
    throw new AppError(ErrorCode.VERIFICATION_EMAIL_SEND_FAILED, 500)
  }
}
