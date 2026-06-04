import request from 'supertest'

import { createApp } from '../../app.js'

export function createTestAgent() {
  return request(createApp())
}
