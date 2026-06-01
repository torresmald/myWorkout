import '../config/cloudinary.js'

import { cloudinary } from '../config/cloudinary.js'
import {
  CLOUDINARY_AVATAR_FOLDER,
  getAvatarPublicId,
  isCloudinaryConfigured,
  isCloudinaryPublicId,
} from '../constants/cloudinary.constants.js'
import { AppError } from '../interfaces/app-error.interface.js'

export async function uploadAvatarImage(
  userId: number,
  buffer: Buffer,
  mimetype: string,
): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new AppError('Cloudinary no está configurado', 500)
  }

  const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: CLOUDINARY_AVATAR_FOLDER,
    public_id: `user-${userId}`,
    overwrite: true,
    invalidate: true,
  })

  return result.public_id ?? getAvatarPublicId(userId)
}

export async function deleteAvatarImage(publicId: string | null | undefined): Promise<void> {
  if (!publicId || !isCloudinaryPublicId(publicId) || !isCloudinaryConfigured()) {
    return
  }

  await cloudinary.uploader.destroy(publicId)
}
