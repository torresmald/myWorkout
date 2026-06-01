import bcrypt from 'bcrypt'

import {
  EMAIL_REGEX,
  FORGOT_PASSWORD_SUCCESS_MESSAGE,
  PASSWORD_RESET_TOKEN_TTL_MS,
  SALT_ROUNDS,
} from '../constants/auth.constants.js'
import { isMailConfigured } from '../constants/mail.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import { normalizeEmail } from '../utils/auth.util.js'
import { generateVerificationToken, hashToken } from '../utils/token.util.js'
import { sendPasswordResetEmail } from './mail.service.js'

function buildResetPasswordUrl(token: string): string {
  const appUrl = process.env.APP_URL ?? 'http://localhost:5173'
  return `${appUrl}/reset-password?token=${encodeURIComponent(token)}`
}

function logResetPasswordUrlInDev(token: string): void {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  console.log(`[dev] Password reset URL: ${buildResetPasswordUrl(token)}`)
}

async function createPasswordResetToken(userId: number): Promise<string> {
  await prisma.passwordResetToken.deleteMany({
    where: { userId },
  })

  const token = generateVerificationToken()
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS)

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
    },
  })

  return token
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
    throw new AppError('Email inválido', 400)
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  if (!user?.password) {
    return { message: FORGOT_PASSWORD_SUCCESS_MESSAGE }
  }

  const token = await createPasswordResetToken(user.id)
  const resetUrl = buildResetPasswordUrl(token)

  if (!isMailConfigured()) {
    logResetPasswordUrlInDev(token)
    return { message: FORGOT_PASSWORD_SUCCESS_MESSAGE }
  }

  try {
    await sendPasswordResetEmail(normalizedEmail, resetUrl)
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    throw new AppError('No se pudo enviar el email de recuperación', 500)
  }

  return { message: FORGOT_PASSWORD_SUCCESS_MESSAGE }
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  const trimmedToken = token.trim()

  if (!trimmedToken) {
    throw new AppError('Enlace de recuperación inválido', 400)
  }

  if (!password || password.length < 6) {
    throw new AppError('La contraseña debe tener al menos 6 caracteres', 400)
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(trimmedToken) },
    include: { user: true },
  })

  if (!resetToken) {
    throw new AppError('Enlace de recuperación inválido o expirado', 400)
  }

  if (resetToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    })
    throw new AppError('El enlace de recuperación ha expirado', 400)
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        password: hashedPassword,
        refreshTokenHash: null,
      },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId },
    }),
  ])

  return { message: 'Contraseña actualizada correctamente' }
}
