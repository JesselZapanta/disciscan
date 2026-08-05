import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const capturingRef = useRef(false)
  const [status, setStatus] = useState('starting')
  const [error, setError] = useState('')
  const [captured, setCaptured] = useState(0)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    let active = true

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 } },
          audio: false,
        })
        if (!active) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setStatus('ready')
      } catch (err) {
        if (!active) return
        setStatus('error')
        if (err.name === 'NotAllowedError') {
          setError('Camera permission was denied. Allow camera access and try again.')
        } else if (err.name === 'NotFoundError') {
          setError('No camera was found on this device.')
        } else {
          setError('Could not start the camera.')
        }
      }
    }

    start()

    return () => {
      active = false
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  function handleCapture() {
    const video = videoRef.current
    if (!video || !video.videoWidth || capturingRef.current) return
    capturingRef.current = true
    setClosing(true)
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) {
        capturingRef.current = false
        setClosing(false)
        return
      }
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
      onCapture(file)
      setCaptured((count) => count + 1)
      window.setTimeout(() => onClose(), 350)
    }, 'image/jpeg', 0.85)
  }

  return (
    <div className="fixed inset-0 z-50 flex select-none flex-col bg-black">
      <div
        className="relative flex-1 overflow-hidden bg-black"
        onClick={status === 'ready' ? handleCapture : undefined}
      >
        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 bg-gradient-to-b from-black/70 to-transparent px-4 pb-10 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-white transition active:bg-white/20"
            aria-label="Close camera and go back"
          >
            <ArrowLeft className="size-6" />
            <span className="text-sm font-mono">BACK</span>
          </button>
          <p className="text-[11px] font-mono text-white/80">
            {captured} SHOT{captured === 1 ? '' : 'S'} CAPTURED
          </p>
        </div>

        {status === 'starting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/80">
            <Loader2 className="size-6 animate-spin" />
            <span className="text-xs font-mono tracking-widest">STARTING CAMERA…</span>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-sm font-mono text-red-400">{error}</p>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="gap-1.5 border-white/30 bg-black/50 text-white"
            >
              <X className="size-4" />
              CLOSE
            </Button>
          </div>
        )}

        {status === 'ready' && (
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-black/70 to-transparent px-6 pb-10 pt-14">
            <p className="text-[11px] font-mono tracking-widest text-white/80">
              {closing ? 'SAVING SHOT…' : 'TAP TO CAPTURE — AUTO RETURN AFTER SHOT'}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleCapture()
              }}
              disabled={closing}
              className="flex size-20 items-center justify-center rounded-full border-4 border-white bg-white/20 backdrop-blur-sm transition active:scale-95 disabled:opacity-60"
              aria-label="Capture photo"
            >
              <span className="size-16 rounded-full bg-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
