export function buildExercisePreview(
  names: string[] | undefined,
  formatMore: (count: number) => string,
  maxShown = 2,
): string {
  if (!names || names.length === 0) {
    return ''
  }

  const visibleNames = names.slice(0, maxShown)
  const remaining = names.length - visibleNames.length

  if (remaining <= 0) {
    return visibleNames.join(', ')
  }

  return `${visibleNames.join(', ')} ${formatMore(remaining)}`
}
