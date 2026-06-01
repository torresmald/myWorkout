import '../config/cloudinary.js'

import { cloudinary } from '../config/cloudinary.js'

export function getCloudinaryImageUrl(publicId: string): string {
  return cloudinary.url(publicId, { secure: true })
}
