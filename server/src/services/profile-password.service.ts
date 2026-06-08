import bcrypt from 'bcrypt'

import { ErrorCode, MessageCode } from '../constants/error-codes.constants.js'
import { SALT_ROUNDS } from '../constants/auth.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type { ChangePasswordBody } from '../interfaces/profile.interface.js'

export async function changeUserPassword(
  userId: number,
  body: ChangePasswordBody,
): Promise<{ messageCode: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  })

  if (!user) {
    throw new AppError(ErrorCode.USER_NOT_FOUND, 404)
  }

  const newPassword = body.newPassword ?? ''

  if (!newPassword || newPassword.length < 6) {
    throw new AppError(ErrorCode.PASSWORD_MIN_LENGTH, 400)
  }

  if (user.password) {
    const currentPassword = body.currentPassword ?? ''

    if (!currentPassword) {
      throw new AppError(ErrorCode.PASSWORD_REQUIRED, 400)
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.password)

    if (!passwordMatches) {
      throw new AppError(ErrorCode.INVALID_CREDENTIALS, 401)
    }
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })

  return { messageCode: MessageCode.PASSWORD_RESET_SUCCESS }
}
