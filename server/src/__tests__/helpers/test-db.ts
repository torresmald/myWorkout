import { PrismaClient } from '@prisma/client'

const TEST_TABLES = [
  'WorkoutSet',
  'WorkoutExercise',
  'Workout',
  'TemplateExercise',
  'WorkoutTemplate',
  'ExerciseType',
  'ExerciseCatalog',
  'WeightEntry',
  'EmailVerificationToken',
  'PasswordResetToken',
  'User',
] as const

let testPrisma: PrismaClient | null = null

export function getTestDatabaseUrl(): string | null {
  return process.env.TEST_DATABASE_URL?.trim() || null
}

export function hasTestDatabase(): boolean {
  return Boolean(getTestDatabaseUrl())
}

export function getTestPrisma(): PrismaClient {
  const url = getTestDatabaseUrl()

  if (!url) {
    throw new Error(
      'TEST_DATABASE_URL o DATABASE_URL no están definidas. Configura una base de datos de test.',
    )
  }

  testPrisma ??= new PrismaClient({
    datasources: {
      db: { url },
    },
  })

  return testPrisma
}

export async function connectTestDatabase(): Promise<PrismaClient> {
  const prisma = getTestPrisma()
  await prisma.$connect()
  return prisma
}

export async function disconnectTestDatabase(): Promise<void> {
  if (!testPrisma) {
    return
  }

  await testPrisma.$disconnect()
  testPrisma = null
}

export async function resetTestDatabase(prisma: PrismaClient = getTestPrisma()): Promise<void> {
  const tableList = TEST_TABLES.map((table) => `"${table}"`).join(', ')
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`)
}
