import { randomBytes } from 'node:crypto'

export function generateRefreshToken(): string {
  return randomBytes(40).toString('hex')
}
