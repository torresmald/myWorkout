import bcrypt from 'bcrypt'

import { EMAIL_REGEX, SALT_ROUNDS, userPublicSelect } from '../constants/auth.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type { LoginBody, LoginResponse, RegisterBody, UserPublic } from '../interfaces/auth.interface.js'
import { normalizeEmail } from '../utils/auth.util.js'
import { signAccessToken } from '../utils/jwt.util.js'
import { generateRefreshToken } from '../utils/token.util.js'

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

export async function registerUser(body: RegisterBody): Promise<UserPublic> {
  const { email, password, name } = validateRegisterBody(body)

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new AppError('El email ya está registrado', 409)
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
    select: userPublicSelect,
  })
}

export async function loginUser(body: LoginBody): Promise<LoginResponse> {
  const { email, password } = validateLoginBody(body)

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Credenciales inválidas', 401)
  }

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

  const token = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  return {
    token,
    refreshToken,
    user: updatedUser,
  }
}

export async function getUserById(userId: number): Promise<UserPublic> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userPublicSelect,
  })

  if (!user) {
    throw new AppError('Usuario no encontrado', 404)
  }

  return user
}
