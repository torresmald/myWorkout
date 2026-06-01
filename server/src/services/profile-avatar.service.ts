import fs from 'node:fs/promises'

import type { Express } from 'express'

import { userPublicSelect } from '../constants/auth.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type { UserPublic } from '../interfaces/auth.interface.js'
import { deleteUploadIfExists } from '../utils/upload-file.util.js'
import { getImageExtension, validateUploadedImage } from '../utils/image-validation.util.js'
import { mapUserToPublic } from '../utils/user-profile.util.js'
import {
  AVATARS_DIR,
  getAvatarRelativePath,
  getUploadAbsolutePath,
} from '../utils/upload-path.util.js'
import { getLatestWeightKg } from './profile.service.js'

export async function uploadProfileAvatar(
  userId: number,
  file: Express.Multer.File,
): Promise<UserPublic> {
  if (!file.buffer?.length) {
    throw new AppError('No se recibió ninguna imagen', 400)
  }

  const imageKind = validateUploadedImage(file.buffer, file.mimetype)
  const extension = getImageExtension(imageKind)
  const relativePath = getAvatarRelativePath(userId, extension)
  const absolutePath = getUploadAbsolutePath(relativePath)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      profileImagePath: true,
    },
  })

  if (!user) {
    throw new AppError('Usuario no encontrado', 404)
  }

  await fs.mkdir(AVATARS_DIR, { recursive: true })
  await fs.writeFile(absolutePath, file.buffer)

  if (user.profileImagePath && user.profileImagePath !== relativePath) {
    await deleteUploadIfExists(user.profileImagePath)
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      profileImagePath: relativePath,
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

  await deleteUploadIfExists(user.profileImagePath)

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
