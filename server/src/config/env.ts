import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'

const serverDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

config({ path: path.join(serverDir, '.env') })
