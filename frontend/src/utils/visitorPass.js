function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath()
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r)
  } else {
    ctx.rect(x, y, w, h)
  }
}

function drawShield(ctx, cx, cy, size) {
  const s = size / 40
  ctx.save()
  ctx.translate(cx - 20 * s, cy - 20 * s)
  ctx.scale(s, s)

  ctx.beginPath()
  ctx.moveTo(20, 2)
  ctx.lineTo(5, 10)
  ctx.lineTo(5, 20)
  ctx.bezierCurveTo(5, 28.25, 11.75, 35.75, 20, 38)
  ctx.bezierCurveTo(28.25, 35.75, 35, 28.25, 35, 20)
  ctx.lineTo(35, 10)
  ctx.closePath()
  ctx.fillStyle = '#151A21'
  ctx.fill()
  ctx.strokeStyle = '#F5A623'
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(20, 5.5)
  ctx.lineTo(8, 12)
  ctx.lineTo(8, 20.5)
  ctx.bezierCurveTo(8, 27.25, 13.25, 33.25, 20, 35)
  ctx.bezierCurveTo(26.75, 33.25, 32, 27.25, 32, 20.5)
  ctx.lineTo(32, 12)
  ctx.closePath()
  ctx.fillStyle = '#0D1117'
  ctx.fill()
  ctx.strokeStyle = 'rgba(245, 166, 35, 0.5)'
  ctx.lineWidth = 0.75
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(16, 21)
  ctx.lineTo(19, 24)
  ctx.lineTo(25, 17)
  ctx.strokeStyle = '#2ECC71'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke()

  ctx.restore()
}

function drawBracket(ctx, x, y, dirX, dirY) {
  const len = 44
  ctx.strokeStyle = '#F5A623'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x + dirX * len, y)
  ctx.lineTo(x, y)
  ctx.lineTo(x, y + dirY * len)
  ctx.stroke()
}

function text(ctx, content, x, y, { color = '#E6EDF3', size = 18, weight = '400', align = 'center' } = {}) {
  ctx.font = `${weight} ${size}px 'JetBrains Mono', ui-monospace, monospace`
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillText(content, x, y)
}

function truncate(str, max) {
  return str.length > max ? `${str.slice(0, max - 1)}…` : str
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function generateEntryPass(record, qrDataUrl, visitDateLabel) {
  await document.fonts.ready

  const W = 640
  const H = 880
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#0D1117'
  ctx.fillRect(0, 0, W, H)

  const m = 28
  drawBracket(ctx, m, m, 1, 1)
  drawBracket(ctx, W - m, m, -1, 1)
  drawBracket(ctx, m, H - m, 1, -1)
  drawBracket(ctx, W - m, H - m, -1, -1)

  const chipW = 224
  const chipH = 44
  const chipY = 84
  ctx.strokeStyle = 'rgba(245, 166, 35, 0.6)'
  ctx.lineWidth = 2
  roundRectPath(ctx, W / 2 - chipW / 2, chipY, chipW, chipH, chipH / 2)
  ctx.stroke()
  text(ctx, 'ENTRY PASS', W / 2, chipY + chipH / 2, { color: '#F5A623', size: 17, weight: '600' })

  drawShield(ctx, W / 2, 190, 64)

  const wordY = 268
  const full = 'DISCI SCAN'
  ctx.font = "700 28px 'JetBrains Mono', ui-monospace, monospace"
  const fullW = ctx.measureText(full).width
  const startX = W / 2 - fullW / 2
  text(ctx, 'DISCI', startX, wordY, { color: '#F5A623', size: 28, weight: '700', align: 'left' })
  const disciW = ctx.measureText('DISCI').width
  text(ctx, 'SCAN', startX + disciW, wordY, { color: '#2ECC71', size: 28, weight: '700', align: 'left' })

  ctx.strokeStyle = 'rgba(230, 237, 243, 0.12)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(W / 2 - 210, 302)
  ctx.lineTo(W / 2 + 210, 302)
  ctx.stroke()

  const tile = { x: 130, y: 340, size: 380 }
  ctx.fillStyle = '#FFFFFF'
  roundRectPath(ctx, tile.x, tile.y, tile.size, tile.size, 18)
  ctx.fill()

  const qrImg = await loadImage(qrDataUrl)
  const qrPad = 24
  ctx.drawImage(qrImg, tile.x + qrPad, tile.y + qrPad, tile.size - qrPad * 2, tile.size - qrPad * 2)

  text(ctx, record.record_no, W / 2, 756, { color: '#F5A623', size: 24, weight: '700' })
  text(ctx, truncate(record.fullname, 34), W / 2, 794, { color: '#FFFFFF', size: 20, weight: '500' })
  text(ctx, visitDateLabel, W / 2, 826, { color: '#8B949E', size: 15 })

  text(ctx, 'TANGUB CITY GLOBAL COLLEGE', W / 2, 848, { color: '#8B949E', size: 12, weight: '600' })
  text(ctx, 'SDG 16 · PEACE, JUSTICE & STRONG INSTITUTIONS', W / 2, 866, {
    color: '#6E7681',
    size: 10,
  })

  return canvas.toDataURL('image/png')
}
