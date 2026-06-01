import fs from 'node:fs/promises'

import { getUploadAbsolutePath } from './upload-path.util.js'

export async function deleteUploadIfExists(relativePath: string | null | undefined): Promise<void> {
  if (!relativePath) {
    return
  }

  try {
    await fs.unlink(getUploadAbsolutePath(relativePath))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }
}
