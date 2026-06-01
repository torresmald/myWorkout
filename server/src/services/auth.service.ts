import bcrypt from 'bcrypt'

import { EMAIL_NOT_VERIFIED_MESSAGE, EMAIL_REGEX, SALT_ROUNDS, userPublicSelect } from '../constants/auth.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type { LoginBody, LoginResponse, RegisterBody, RegisterResponse, UserPublic } from '../interfaces/auth.interface.js'
import type { GoogleUserProfile } from '../interfaces/google.interface.js'
import { normalizeEmail } from '../utils/auth.util.js'
import { signAccessToken } from '../utils/jwt.util.js'
import { generateRefreshToken } from '../utils/token.util.js'
import {
  createEmailVerificationToken,
  sendUserVerificationEmail,
} from './email-verification.service.js'
import { verifyGoogleIdToken } from './google-auth.service.js'
import { getLatestWeightKg } from './profile.service.js'
import { mapUserToPublic } from '../utils/user-profile.util.js'

function validateRegisterBody(body: RegisterBody): { email: string; password: string; name: string | null } {
  const { email, password, name } = body

  if (!email || !EMAIL_REGEX.test(email)) {
    throw new AppError('Email inválido', 400)
  }

  if (!password || password.length < 6) {
    throw new AppError('La contraseña debe tener al menos 6 caracteres', 400)
  }

  return {
    email: normalizeEmail(email),
    password,
    name: name?.trim() || null,
  }
}

function validateLoginBody(body: LoginBody): { email: string; password: string } {
  const { email, password } = body

  if (!email || !password) {
    throw new AppError('Email y contraseña son obligatorios', 400)
  }

  return {
    email: normalizeEmail(email),
    password,
  }
}

async function createUserSession(user: {
  id: number
  email: string
  role: UserPublic['role']
}): Promise<LoginResponse> {
  const refreshToken = generateRefreshToken()
  const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS)

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshTokenHash,
      lastLoginAt: new Date(),
    },
    select: userPublicSelect,
  })

  const latestWeightKg = await getLatestWeightKg(user.id)
  const token = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  return {
    token,
    refreshToken,
    user: mapUserToPublic(updatedUser, latestWeightKg),
  }
}

async function findOrCreateGoogleUser(profile: GoogleUserProfile) {
  if (!profile.emailVerified) {
    throw new AppError('El email de Google no está verificado', 401)
  }

  const existingByGoogleId = await prisma.user.findUnique({
    where: { googleId: profile.googleId },
  })

  if (existingByGoogleId) {
    return existingByGoogleId
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: profile.email },
  })

  if (existingByEmail) {
    if (existingByEmail.googleId && existingByEmail.googleId !== profile.googleId) {
      throw new AppError('Esta cuenta ya está vinculada a otro inicio de sesión de Google', 409)
    }

    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        googleId: profile.googleId,
        name: existingByEmail.name ?? profile.name,
        emailVerifiedAt: existingByEmail.emailVerifiedAt ?? new Date(),
      },
    })
  }

  return prisma.user.create({
    data: {
      email: profile.email,
      googleId: profile.googleId,
      name: profile.name,
      emailVerifiedAt: new Date(),
    },
  })
}

export async function loginWithGoogle(idToken: string): Promise<LoginResponse> {
  const profile = await verifyGoogleIdToken(idToken)
  const user = await findOrCreateGoogleUser(profile)
  return createUserSession(user)
}

export async function registerUser(body: RegisterBody): Promise<RegisterResponse> {
  const { email, password, name } = validateRegisterBody(body)

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new AppError('El email ya está registrado', 409)
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      emailVerifiedAt: null,
    },
  })

  const verificationToken = await createEmailVerificationToken(user.id)
  await sendUserVerificationEmail(email, verificationToken)

  return {
    message: 'Revisa tu email para activar la cuenta',
    email,
  }
}

export async function loginUser(body: LoginBody): Promise<LoginResponse> {
  const { email, password } = validateLoginBody(body)

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Credenciales inválidas', 401)
  }

  if (!user.emailVerifiedAt) {
    throw new AppError(EMAIL_NOT_VERIFIED_MESSAGE, 403)
  }

  return createUserSession(user)
}

export async function getUserById(userId: number): Promise<UserPublic> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userPublicSelect,
  })

  if (!user) {
    throw new AppError('Usuario no encontrado', 404)
  }

  const latestWeightKg = await getLatestWeightKg(userId)
  return mapUserToPublic(user, latestWeightKg)
}
