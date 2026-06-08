import bcrypt from 'bcrypt'

import { ErrorCode } from '../constants/error-codes.constants.js'
import { SALT_ROUNDS } from '../constants/auth.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import { deleteAvatarImage } from './cloudinary.service.js'

export async function deleteUserAccount(userId: number, password?: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      password: true,
      role: true,
      profileImagePath: true,
    },
  })

  if (!user) {
    throw new AppError(ErrorCode.USER_NOT_FOUND, 404)
  }

  if (user.role === 'ADMIN') {
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    })

    if (adminCount <= 1) {
      throw new AppError(ErrorCode.CANNOT_DELETE_LAST_ADMIN, 403)
    }
  }

  if (user.password) {
    if (!password) {
      throw new AppError(ErrorCode.PASSWORD_REQUIRED, 400)
    }

    const passwordMatches = await bcrypt.compare(password, user.password)

    if (!passwordMatches) {
      throw new AppError(ErrorCode.INVALID_CREDENTIALS, 401)
    }
  }

  if (user.profileImagePath) {
    try {
      await deleteAvatarImage(user.profileImagePath)
    } catch {
      // Continue account deletion even if avatar cleanup fails.
    }
  }

  await prisma.user.delete({
    where: { id: userId },
  })
}
