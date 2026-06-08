import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outputPath = join(__dirname, '../public/sounds/rest-complete.wav')

const SAMPLE_RATE = 44100

function writeTone(samples, startIndex, frequency, durationSec, volume = 0.35) {
  const sampleCount = Math.floor(SAMPLE_RATE * durationSec)
  const fadeSamples = Math.floor(SAMPLE_RATE * 0.02)

  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / SAMPLE_RATE
    const fadeIn = Math.min(1, i / fadeSamples)
    const fadeOut = Math.min(1, (sampleCount - i) / fadeSamples)
    const envelope = Math.min(fadeIn, fadeOut)
    const sample = Math.sin(2 * Math.PI * frequency * t) * volume * envelope
    const index = startIndex + i

    if (index >= samples.length) {
      break
    }

    samples[index] += sample
  }
}

function encodeWav(samples) {
  const buffer = Buffer.alloc(44 + samples.length * 2)

  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + samples.length * 2, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(SAMPLE_RATE, 24)
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(samples.length * 2, 40)

  for (let i = 0; i < samples.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]))
    buffer.writeInt16LE(Math.floor(clamped * 32767), 44 + i * 2)
  }

  return buffer
}

const totalDurationSec = 1.1
const sampleCount = Math.floor(SAMPLE_RATE * totalDurationSec)
const samples = new Float64Array(sampleCount)

writeTone(samples, 0, 880, 0.18)
writeTone(samples, Math.floor(SAMPLE_RATE * 0.28), 880, 0.18)
writeTone(samples, Math.floor(SAMPLE_RATE * 0.56), 1174.66, 0.28)

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, encodeWav(samples))

console.log(`Generated ${outputPath}`)
