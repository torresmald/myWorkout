import type { Express } from 'express'

import { userPublicSelect } from '../constants/auth.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type { UserPublic } from '../interfaces/auth.interface.js'
import { validateUploadedImage } from '../utils/image-validation.util.js'
import { mapUserToPublic } from '../utils/user-profile.util.js'
import { deleteAvatarImage, uploadAvatarImage } from './cloudinary.service.js'
import { getLatestWeightKg } from './profile.service.js'

export async function uploadProfileAvatar(
  userId: number,
  file: Express.Multer.File,
): Promise<UserPublic> {
  if (!file.buffer?.length) {
    throw new AppError('No se recibió ninguna imagen', 400)
  }

  validateUploadedImage(file.buffer, file.mimetype)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      profileImagePath: true,
    },
  })

  if (!user) {
    throw new AppError('Usuario no encontrado', 404)
  }

  const publicId = await uploadAvatarImage(userId, file.buffer, file.mimetype)

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      profileImagePath: publicId,
    },
    select: userPublicSelect,
  })

  const latestWeightKg = await getLatestWeightKg(userId)
  return mapUserToPublic(updatedUser, latestWeightKg)
}

export async function deleteProfileAvatar(userId: number): Promise<UserPublic> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userPublicSelect,
  })

  if (!user) {
    throw new AppError('Usuario no encontrado', 404)
  }

  await deleteAvatarImage(user.profileImagePath)

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      profileImagePath: null,
    },
    select: userPublicSelect,
  })

  const latestWeightKg = await getLatestWeightKg(userId)
  return mapUserToPublic(updatedUser, latestWeightKg)
}
