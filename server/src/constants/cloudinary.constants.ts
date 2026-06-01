export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? ''
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY?.trim() ?? ''
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET?.trim() ?? ''
export const CLOUDINARY_AVATAR_FOLDER = 'myworkout/avatars'

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET)
}

export function getAvatarPublicId(userId: number): string {
  return `${CLOUDINARY_AVATAR_FOLDER}/user-${userId}`
}

export function isCloudinaryPublicId(path: string): boolean {
  return path.startsWith(`${CLOUDINARY_AVATAR_FOLDER}/`)
}
