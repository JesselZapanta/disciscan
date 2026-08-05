let successAudio = null
let failureAudio = null

function soundSrc(name) {
  return `${import.meta.env.BASE_URL}sounds/${name}`
}

function audioFor(kind) {
  if (typeof window === 'undefined' || !window.Audio) return null
  if (kind === 'success') {
    if (!successAudio) {
      successAudio = new Audio(soundSrc('success.wav'))
      successAudio.preload = 'auto'
    }
    return successAudio
  }
  if (!failureAudio) {
    failureAudio = new Audio(soundSrc('failure.wav'))
    failureAudio.preload = 'auto'
  }
  return failureAudio
}

export function unlockAudio() {
  if (typeof window === 'undefined' || !window.Audio) return
  audioFor('success')
  audioFor('failure')
  const probe = new Audio(soundSrc('success.wav'))
  probe.volume = 0
  probe.play().then(() => probe.pause()).catch(() => {})
}

export function playSuccess() {
  const audio = audioFor('success')
  if (!audio) return
  audio.currentTime = 0
  audio.play().catch(() => {})
}

export function playFailure() {
  const audio = audioFor('failure')
  if (!audio) return
  audio.currentTime = 0
  audio.play().catch(() => {})
}
