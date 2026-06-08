import {
  KG_TO_LB,
  MAX_WEIGHT_KG,
  MIN_WEIGHT_KG,
  type WeightUnit,
} from '@/constants/weight-unit.constants'

export function kgToLb(kg: number): number {
  return Number((kg * KG_TO_LB).toFixed(1))
}

export function lbToKg(lb: number): number {
  return Number((lb / KG_TO_LB).toFixed(2))
}

export function convertWeightFromKg(kg: number, unit: WeightUnit): number {
  return unit === 'lb' ? kgToLb(kg) : Number(kg.toFixed(1))
}

export function convertWeightToKg(value: number, unit: WeightUnit): number {
  return unit === 'lb' ? lbToKg(value) : Number(value.toFixed(2))
}

export function getWeightInputBounds(unit: WeightUnit): { min: number; max: number; step: number } {
  if (unit === 'lb') {
    return {
      min: kgToLb(MIN_WEIGHT_KG),
      max: kgToLb(MAX_WEIGHT_KG),
      step: 0.1,
    }
  }

  return {
    min: MIN_WEIGHT_KG,
    max: MAX_WEIGHT_KG,
    step: 0.1,
  }
}

export function isValidDisplayWeight(value: number, unit: WeightUnit): boolean {
  const kg = convertWeightToKg(value, unit)
  return kg >= MIN_WEIGHT_KG && kg <= MAX_WEIGHT_KG
}

export function formatWeightValue(kg: number | null | undefined, unit: WeightUnit): string {
  if (kg === null || kg === undefined) {
    return ''
  }

  const value = convertWeightFromKg(kg, unit)
  const suffix = unit === 'lb' ? ' lb' : ' kg'
  return `${value}${suffix}`
}

export function formatWeightNumber(kg: number | null | undefined, unit: WeightUnit): string {
  if (kg === null || kg === undefined) {
    return ''
  }

  return String(convertWeightFromKg(kg, unit))
}

export function getWeightUnitSuffix(unit: WeightUnit): string {
  return unit === 'lb' ? 'lb' : 'kg'
}
