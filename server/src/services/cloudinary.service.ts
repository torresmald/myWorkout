import '../config/cloudinary.js'

import { cloudinary } from '../config/cloudinary.js'
import {
  CLOUDINARY_AVATAR_FOLDER,
  CLOUDINARY_CATALOG_FOLDER,
  getAvatarPublicId,
  isCloudinaryConfigured,
  isCloudinaryPublicId,
} from '../constants/cloudinary.constants.js'
import {
  getCatalogMediaTypeFromMime,
  isAllowedCatalogMediaMime,
} from '../constants/catalog-media.constants.js'
import { ErrorCode } from '../constants/error-codes.constants.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type { CatalogMediaUploadResult } from '../interfaces/catalog-media.interface.js'

export async function uploadAvatarImage(
  userId: number,
  buffer: Buffer,
  mimetype: string,
): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new AppError(ErrorCode.CLOUDINARY_NOT_CONFIGURED, 500)
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

function normalizeCatalogSlug(slug: string | undefined): string {
  const normalized = slug?.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '')

  if (!normalized) {
    return `media-${Date.now()}`
  }

  return normalized
}

export async function uploadCatalogMedia(
  buffer: Buffer,
  mimetype: string,
  slug?: string,
): Promise<CatalogMediaUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new AppError(ErrorCode.CLOUDINARY_NOT_CONFIGURED, 500)
  }

  if (!isAllowedCatalogMediaMime(mimetype)) {
    throw new AppError(ErrorCode.CATALOG_MEDIA_FORMAT_NOT_ALLOWED, 400)
  }

  const mediaType = getCatalogMediaTypeFromMime(mimetype)

  if (!mediaType) {
    throw new AppError(ErrorCode.CATALOG_MEDIA_FORMAT_NOT_ALLOWED, 400)
  }

  const isVideo = mediaType === 'VIDEO'
  const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`
  const publicId = normalizeCatalogSlug(slug)

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: CLOUDINARY_CATALOG_FOLDER,
    public_id: publicId,
    overwrite: true,
    invalidate: true,
    resource_type: isVideo ? 'video' : 'image',
  })

  if (!result.secure_url) {
    throw new AppError(ErrorCode.IMAGE_UPLOAD_FAILED, 500)
  }

  return {
    mediaUrl: result.secure_url,
    mediaType,
  }
}
