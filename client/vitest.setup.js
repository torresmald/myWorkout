import { afterEach, vi } from 'vitest'

vi.mock('vue-chartjs', () => ({
  Bar: {
    name: 'Bar',
    template: '<canvas data-testid="bar-chart" />',
  },
  Line: {
    name: 'Line',
    template: '<canvas data-testid="line-chart" />',
  },
}))

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

afterEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})
