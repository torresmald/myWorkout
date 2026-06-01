import { ALLOWED_IMAGE_MIME_TYPES } from '../constants/profile.constants.js'
import { AppError } from '../interfaces/app-error.interface.js'

export type ImageKind = 'jpeg' | 'png' | 'webp'

type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number]

const MIME_BY_KIND: Record<ImageKind, AllowedImageMimeType> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

const EXTENSION_BY_KIND: Record<ImageKind, string> = {
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
}

export function detectImageKind(buffer: Buffer): ImageKind | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpeg'
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png'
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp'
  }

  return null
}

export function validateUploadedImage(buffer: Buffer, mimeType: string): ImageKind {
  const detectedKind = detectImageKind(buffer)

  if (!detectedKind) {
    throw new AppError('Formato de imagen no permitido. Usa JPEG, PNG o WebP', 400)
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as AllowedImageMimeType)) {
    throw new AppError('Formato de imagen no permitido. Usa JPEG, PNG o WebP', 400)
  }

  if (mimeType !== MIME_BY_KIND[detectedKind]) {
    throw new AppError('El tipo de archivo no coincide con su contenido', 400)
  }

  return detectedKind
}

export function getImageExtension(kind: ImageKind): string {
  return EXTENSION_BY_KIND[kind]
}
