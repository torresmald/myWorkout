import { vi } from 'vitest'

import { getAvatarPublicId } from '../../constants/cloudinary.constants.js'

export const cloudinaryServiceMocks = {
  uploadAvatarImage: vi.fn(async (userId: number) => getAvatarPublicId(userId)),
  deleteAvatarImage: vi.fn().mockResolvedValue(undefined),
  uploadCatalogMedia: vi.fn().mockResolvedValue({
    mediaUrl: 'https://res.cloudinary.com/test-cloud/image/upload/v1/myworkout/catalog/test.png',
    mediaType: 'IMAGE',
  }),
}

vi.mock('../../services/cloudinary.service.js', () => ({
  uploadAvatarImage: (...args: unknown[]) => cloudinaryServiceMocks.uploadAvatarImage(...args),
  deleteAvatarImage: (...args: unknown[]) => cloudinaryServiceMocks.deleteAvatarImage(...args),
  uploadCatalogMedia: (...args: unknown[]) => cloudinaryServiceMocks.uploadCatalogMedia(...args),
}))

vi.mock('../../utils/cloudinary-image.util.js', () => ({
  getCloudinaryImageUrl: (publicId: string) =>
    `https://res.cloudinary.com/test-cloud/image/upload/${publicId}`,
}))
