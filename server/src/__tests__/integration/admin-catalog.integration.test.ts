import { beforeAll, beforeEach, afterAll, describe, expect, it, vi } from 'vitest'

import { MINIMAL_PNG_BUFFER } from '../fixtures/test-image.fixture.js'
import { authHeader } from '../helpers/test-auth.js'
import { createAdminCatalogEntry, loginAdminTestUser } from '../helpers/test-admin.js'
import { createTestAgent } from '../helpers/test-app.js'
import {
  connectTestDatabase,
  disconnectTestDatabase,
  hasTestDatabase,
  resetTestDatabase,
} from '../helpers/test-db.js'
import { loginVerifiedTestUser } from '../helpers/test-session.js'
import { ErrorCode } from '../../constants/error-codes.constants.js'

const uploadCatalogMedia = vi.fn()

vi.mock('../../services/cloudinary.service.js', () => ({
  uploadAvatarImage: vi.fn(),
  deleteAvatarImage: vi.fn(),
  uploadCatalogMedia: (...args: unknown[]) => uploadCatalogMedia(...args),
}))

const describeIntegration = hasTestDatabase() ? describe : describe.skip

describeIntegration('admin exercise-catalog API', () => {
  const agent = createTestAgent()

  beforeAll(async () => {
    await connectTestDatabase()
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  beforeEach(async () => {
    await resetTestDatabase()
    uploadCatalogMedia.mockReset()
    uploadCatalogMedia.mockResolvedValue({
      mediaUrl: 'https://res.cloudinary.com/demo/image/upload/v1/myworkout/catalog/test.png',
      mediaType: 'IMAGE',
    })
  })

  describe('autorización', () => {
    it('rechaza usuario normal en catálogo admin', async () => {
      const session = await loginVerifiedTestUser(agent)

      const response = await agent
        .get('/api/admin/exercise-catalog')
        .set(authHeader(session.token))

      expect(response.status).toBe(403)
      expect(response.body.error).toBe('Acceso denegado')
    })
  })

  describe('CRUD de catálogo admin', () => {
    it('rechaza crear entrada sin slug', async () => {
      const admin = await loginAdminTestUser(agent)

      const response = await agent
        .post('/api/admin/exercise-catalog')
        .set(authHeader(admin.token))
        .send({
          nameEs: 'Fondos',
          nameEn: 'Dips',
          muscleGroup: 'ARMS',
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(ErrorCode.CATALOG_SLUG_REQUIRED)
    })

    it('crea, lista, actualiza y elimina entradas', async () => {
      const admin = await loginAdminTestUser(agent)
      const created = await createAdminCatalogEntry(agent, admin.token, {
        slug: 'hip-thrust',
        nameEs: 'Empuje de cadera',
        nameEn: 'Hip thrust',
        muscleGroup: 'LEGS',
      })

      const list = await agent
        .get('/api/admin/exercise-catalog')
        .set(authHeader(admin.token))

      expect(list.status).toBe(200)
      expect(list.body.data.some((entry: { id: number }) => entry.id === created.id)).toBe(true)

      const updated = await agent
        .put(`/api/admin/exercise-catalog/${created.id}`)
        .set(authHeader(admin.token))
        .send({ nameEs: 'Hip thrust pesado' })

      expect(updated.status).toBe(200)
      expect(updated.body.data.nameEs).toBe('Hip thrust pesado')

      const deleted = await agent
        .delete(`/api/admin/exercise-catalog/${created.id}`)
        .set(authHeader(admin.token))

      expect(deleted.status).toBe(200)

      const listAfterDelete = await agent
        .get('/api/admin/exercise-catalog')
        .set(authHeader(admin.token))

      expect(listAfterDelete.body.data.some((entry: { id: number }) => entry.id === created.id)).toBe(
        false,
      )
    })

    it('rechaza slug duplicado', async () => {
      const admin = await loginAdminTestUser(agent)

      await createAdminCatalogEntry(agent, admin.token, { slug: 'pull-up' })

      const response = await agent
        .post('/api/admin/exercise-catalog')
        .set(authHeader(admin.token))
        .send({
          slug: 'pull-up',
          nameEs: 'Dominadas',
          nameEn: 'Pull up',
          muscleGroup: 'BACK',
        })

      expect(response.status).toBe(409)
      expect(response.body.error).toBe(ErrorCode.DUPLICATE_CATALOG_SLUG)
    })

    it('rechaza actualización vacía', async () => {
      const admin = await loginAdminTestUser(agent)
      const entry = await createAdminCatalogEntry(agent, admin.token)

      const response = await agent
        .put(`/api/admin/exercise-catalog/${entry.id}`)
        .set(authHeader(admin.token))
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(ErrorCode.NO_DATA_TO_UPDATE)
    })

    it('desactiva entrada importada en lugar de borrarla', async () => {
      const admin = await loginAdminTestUser(agent)
      const user = await loginVerifiedTestUser(agent)
      const entry = await createAdminCatalogEntry(agent, admin.token, {
        slug: 'lat-pulldown',
        nameEs: 'Jalón al pecho',
        nameEn: 'Lat pulldown',
      })

      await agent
        .post(`/api/exercise-catalog/${entry.id}/import`)
        .set(authHeader(user.token))

      const deleted = await agent
        .delete(`/api/admin/exercise-catalog/${entry.id}`)
        .set(authHeader(admin.token))

      expect(deleted.status).toBe(200)
      expect(deleted.body.data.active).toBe(false)

      const userCatalog = await agent
        .get('/api/exercise-catalog')
        .set(authHeader(user.token))

      expect(userCatalog.body.data).toHaveLength(0)

      const adminList = await agent
        .get('/api/admin/exercise-catalog')
        .set(authHeader(admin.token))

      const softDeleted = adminList.body.data.find(
        (item: { id: number }) => item.id === entry.id,
      )
      expect(softDeleted.active).toBe(false)
      expect(softDeleted.importCount).toBe(1)
    })
  })

  describe('POST /api/admin/exercise-catalog/media/upload', () => {
    it('rechaza subida sin archivo', async () => {
      const admin = await loginAdminTestUser(agent)

      const response = await agent
        .post('/api/admin/exercise-catalog/media/upload')
        .set(authHeader(admin.token))

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(ErrorCode.NO_IMAGE_RECEIVED)
    })

    it('sube media de catálogo con Cloudinary mockeado', async () => {
      const admin = await loginAdminTestUser(agent)

      const response = await agent
        .post('/api/admin/exercise-catalog/media/upload')
        .set(authHeader(admin.token))
        .field('slug', 'bench-press-demo')
        .attach('media', MINIMAL_PNG_BUFFER, {
          filename: 'bench.png',
          contentType: 'image/png',
        })

      expect(response.status).toBe(201)
      expect(uploadCatalogMedia).toHaveBeenCalledOnce()
      expect(response.body.data.mediaUrl).toContain('cloudinary.com')
      expect(response.body.data.mediaType).toBe('IMAGE')
    })
  })
})
