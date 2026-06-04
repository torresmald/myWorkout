import { beforeEach, describe, expect, it, vi } from 'vitest'

import { prisma } from '../../config/prisma.js'
import { createTestAgent } from '../helpers/test-app.js'

vi.mock('../../config/prisma.js', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}))

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.mocked(prisma.$queryRaw).mockReset()
  })

  it('responde ok cuando la base de datos está disponible', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ '?column?': 1 }])

    const response = await createTestAgent().get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body.status).toBe('success')
    expect(response.body.data).toMatchObject({
      status: 'ok',
      database: 'connected',
    })
    expect(response.body.data.timestamp).toBeTruthy()
  })

  it('responde 503 cuando la base de datos no está disponible', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('connection refused'))

    const response = await createTestAgent().get('/api/health')

    expect(response.status).toBe(503)
    expect(response.body).toEqual({
      status: 'error',
      data: null,
      error: 'Database unavailable',
      errorParams: null,
    })
  })
})
