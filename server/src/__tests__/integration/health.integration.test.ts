import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createTestAgent } from '../helpers/test-app.js'
import {
  connectTestDatabase,
  disconnectTestDatabase,
  hasTestDatabase,
} from '../helpers/test-db.js'

const describeIntegration = hasTestDatabase() ? describe : describe.skip

describeIntegration('integración /api/health', () => {
  beforeAll(async () => {
    await connectTestDatabase()
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  it('conecta con la base de datos real de test', async () => {
    const response = await createTestAgent().get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body.data.database).toBe('connected')
  })
})
