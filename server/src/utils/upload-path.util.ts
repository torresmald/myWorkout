import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { AVATARS_SUBDIR } from '../constants/profile.constants.js'

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

export const UPLOADS_DIR = path.join(serverRoot, 'uploads')
export const AVATARS_DIR = path.join(UPLOADS_DIR, AVATARS_SUBDIR)

export function getAvatarRelativePath(userId: number, extension: string): string {
  return `${AVATARS_SUBDIR}/${userId}.${extension}`
}

export function getUploadAbsolutePath(relativePath: string): string {
  const normalized = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, '')

  if (normalized.includes('..')) {
    throw new Error('Invalid upload path')
  }

  return path.join(UPLOADS_DIR, normalized)
}
