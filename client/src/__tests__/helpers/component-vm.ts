import type { VueWrapper } from '@vue/test-utils'

export function getExposed<T>(wrapper: VueWrapper): T {
  return wrapper.vm as T
}
