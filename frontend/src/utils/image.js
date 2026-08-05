export async function compressImage(file, { maxDim = 512, quality = 0.8 } = {}) {
  if (!file.type.startsWith('image/')) return file

  const image = await createImageBitmap(file).catch(() => null)
  if (!image) return file

  const scale = Math.min(1, maxDim / Math.max(image.width, image.height))
  if (scale === 1 && file.size <= 512 * 1024) {
    image.close()
    return file
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.width * scale))
  canvas.height = Math.max(1, Math.round(image.height * scale))
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  image.close()

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!blob) return file
  if (blob.size >= file.size) return file

  const name = file.name.replace(/\.[^.]+$/, '.jpg')
  return new File([blob], name, { type: 'image/jpeg' })
}
