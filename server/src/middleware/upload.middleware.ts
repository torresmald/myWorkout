import multer from 'multer'

import { ErrorCode } from '../constants/error-codes.constants.js'
import { ALLOWED_IMAGE_MIME_TYPES, MAX_AVATAR_SIZE_BYTES } from '../constants/profile.constants.js'
import { AppError } from '../interfaces/app-error.interface.js'
import { handleServiceError } from '../utils/app-error.util.js'

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_AVATAR_SIZE_BYTES,
    files: 1,
  },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
      cb(new AppError(ErrorCode.IMAGE_FORMAT_NOT_ALLOWED, 400))
      return
    }

    cb(null, true)
  },
})

export const uploadAvatarMiddleware = avatarUpload.single('avatar')

export function handleAvatarUpload(
  req: Parameters<typeof uploadAvatarMiddleware>[0],
  res: Parameters<typeof uploadAvatarMiddleware>[1],
  next: Parameters<typeof uploadAvatarMiddleware>[2],
) {
  uploadAvatarMiddleware(req, res, (error) => {
    if (!error) {
      next()
      return
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        handleServiceError(new AppError(ErrorCode.IMAGE_TOO_LARGE, 400), res)
        return
      }

      handleServiceError(new AppError(ErrorCode.IMAGE_UPLOAD_FAILED, 400), res)
      return
    }

    if (handleServiceError(error, res)) {
      return
    }

    throw error
  })
}
