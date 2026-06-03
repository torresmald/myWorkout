import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/api/client'
import * as templateApi from '@/api/template.api'

vi.mock('@/api/client', () => ({
  api: vi.fn(),
}))

describe('template.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getTemplates obtiene plantillas', async () => {
    vi.mocked(api).mockResolvedValue([])

    await templateApi.getTemplates()

    expect(api).toHaveBeenCalledWith('/templates')
  })

  it('getTemplate obtiene detalle de plantilla', async () => {
    vi.mocked(api).mockResolvedValue({})

    await templateApi.getTemplate(4)

    expect(api).toHaveBeenCalledWith('/templates/4')
  })

  it('createTemplate crea una plantilla', async () => {
    const body = { name: 'Push day' }
    vi.mocked(api).mockResolvedValue({})

    await templateApi.createTemplate(body)

    expect(api).toHaveBeenCalledWith('/templates', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  })

  it('updateTemplate actualiza una plantilla', async () => {
    const body = { name: 'Pull day' }
    vi.mocked(api).mockResolvedValue({})

    await templateApi.updateTemplate(4, body)

    expect(api).toHaveBeenCalledWith('/templates/4', {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  })

  it('deleteTemplate elimina una plantilla', async () => {
    vi.mocked(api).mockResolvedValue({})

    await templateApi.deleteTemplate(4)

    expect(api).toHaveBeenCalledWith('/templates/4', {
      method: 'DELETE',
    })
  })

  it('getTemplateExercises obtiene ejercicios de plantilla', async () => {
    vi.mocked(api).mockResolvedValue([])

    await templateApi.getTemplateExercises(4)

    expect(api).toHaveBeenCalledWith('/templates/4/exercises')
  })

  it('createTemplateExercise añade ejercicio a plantilla', async () => {
    const body = { exerciseTypeId: 1, orderIndex: 0 }
    vi.mocked(api).mockResolvedValue({})

    await templateApi.createTemplateExercise(4, body)

    expect(api).toHaveBeenCalledWith('/templates/4/exercises', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  })

  it('updateTemplateExercise actualiza ejercicio de plantilla', async () => {
    const body = { sortOrder: 2 }
    vi.mocked(api).mockResolvedValue({})

    await templateApi.updateTemplateExercise(4, 7, body)

    expect(api).toHaveBeenCalledWith('/templates/4/exercises/7', {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  })

  it('deleteTemplateExercise elimina ejercicio de plantilla', async () => {
    vi.mocked(api).mockResolvedValue({})

    await templateApi.deleteTemplateExercise(4, 7)

    expect(api).toHaveBeenCalledWith('/templates/4/exercises/7', {
      method: 'DELETE',
    })
  })
})
