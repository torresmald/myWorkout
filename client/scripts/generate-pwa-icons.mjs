import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')
const svg = readFileSync(join(publicDir, 'icon.svg'))

for (const size of [192, 512]) {
  await sharp(svg).resize(size, size).png().toFile(join(publicDir, `pwa-${size}x${size}.png`))
}

console.log('PWA icons generated')
