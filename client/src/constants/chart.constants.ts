export const CHART_COLORS = {
  primary: '#2563eb',
  primarySoft: 'rgba(37, 99, 235, 0.12)',
  secondary: '#0ea5e9',
  secondarySoft: 'rgba(14, 165, 233, 0.12)',
  accent: '#10b981',
  accentSoft: 'rgba(16, 185, 129, 0.12)',
  gridLight: '#e5e7eb',
  gridDark: '#374151',
  tickLight: '#6b7280',
  tickDark: '#9ca3af',
  pointBorderLight: '#ffffff',
  pointBorderDark: '#111827',
} as const

export function getChartTheme(isDark: boolean) {
  return {
    gridColor: isDark ? CHART_COLORS.gridDark : CHART_COLORS.gridLight,
    tickColor: isDark ? CHART_COLORS.tickDark : CHART_COLORS.tickLight,
    pointBorderColor: isDark ? CHART_COLORS.pointBorderDark : CHART_COLORS.pointBorderLight,
  }
}
