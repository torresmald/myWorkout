export interface BmiResult {
  bmi: number | null
  bmiCategory: string | null
}

export function calculateBmi(weightKg: number | null, heightCm: number | null): BmiResult {
  if (weightKg === null || heightCm === null || heightCm <= 0) {
    return { bmi: null, bmiCategory: null }
  }

  const heightM = heightCm / 100
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1))

  return {
    bmi,
    bmiCategory: getBmiCategory(bmi),
  }
}

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) {
    return 'Bajo peso'
  }

  if (bmi < 25) {
    return 'Peso normal'
  }

  if (bmi < 30) {
    return 'Sobrepeso'
  }

  return 'Obesidad'
}
