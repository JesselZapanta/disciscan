import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RATE = 44100
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sounds')

function toneBuffer({ frequency, duration, type = 'sine', volume = 0.5, fadeIn = 0.01, fadeOut = 0.05 }) {
  const n = Math.floor(RATE * duration)
  const samples = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const t = i / RATE
    let v = 0
    if (type === 'sine') {
      v = Math.sin(2 * Math.PI * frequency * t)
    } else if (type === 'triangle') {
      v = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t))
    }
    const fade = Math.min(1, i / (RATE * fadeIn), (n - i) / (RATE * fadeOut))
    samples[i] = v * volume * Math.max(0, Math.min(1, fade))
  }
  return samples
}

function mix(parts, totalDuration) {
  const n = Math.floor(RATE * totalDuration)
  const out = new Float32Array(n)
  for (const { start, buffer } of parts) {
    const offset = Math.floor(start * RATE)
    for (let i = 0; i < buffer.length && offset + i < n; i++) {
      out[offset + i] += buffer[i]
    }
  }
  return out
}

function toWav(samples) {
  const bytesPerSample = 2
  const dataSize = samples.length * bytesPerSample
  const buffer = Buffer.alloc(44 + dataSize)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(RATE, 24)
  buffer.writeUInt32LE(RATE * bytesPerSample, 28)
  buffer.writeUInt16LE(bytesPerSample, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]))
    buffer.writeInt16LE(Math.round(v * 32767), 44 + i * 2)
  }
  return buffer
}

const success = mix(
  [
    { start: 0, buffer: toneBuffer({ frequency: 880, duration: 0.12 }) },
    { start: 0.13, buffer: toneBuffer({ frequency: 1318.5, duration: 0.2 }) },
  ],
  0.4
)

const failure = mix(
  [
    { start: 0, buffer: toneBuffer({ frequency: 392, duration: 0.18, type: 'triangle', volume: 0.45 }) },
    { start: 0.2, buffer: toneBuffer({ frequency: 261.6, duration: 0.3, type: 'triangle', volume: 0.45 }) },
  ],
  0.6
)

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(join(OUT_DIR, 'success.wav'), toWav(success))
writeFileSync(join(OUT_DIR, 'failure.wav'), toWav(failure))
console.log(`Sounds written to ${OUT_DIR}`)
