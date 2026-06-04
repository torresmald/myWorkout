import { describe, expect, it } from 'vitest'

import { createTestAgent } from './helpers/test-app.js'

describe('createApp', () => {
  it('devuelve 404 para rutas desconocidas', async () => {
    const response = await createTestAgent().get('/api/unknown-route')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      status: 'error',
      data: null,
      error: 'Ruta no encontrada',
      errorParams: null,
    })
  })
})
