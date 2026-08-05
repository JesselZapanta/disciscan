import { roundRectPath, drawShield, drawBracket, text, truncate, loadImage } from './visitorPass.js'

export function studentQrName(student) {
  const last = [student.lastname, student.extension].filter(Boolean).join(' ').toUpperCase()
  const rest = [student.firstname, student.middlename].filter(Boolean).join(' ').toUpperCase()
  return `${last}, ${rest}`
}

export function studentQrText(student) {
  return `IdNumber:${student.id_number};Name:${studentQrName(student)};Contact#:${student.contact_no};ProgramYr:${student.program_and_year}`
}

export async function generateStudentPass(student, qrDataUrl) {
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
  text(ctx, 'STUDENT PASS', W / 2, chipY + chipH / 2, { color: '#F5A623', size: 17, weight: '600' })

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

  text(ctx, student.id_number, W / 2, 756, { color: '#F5A623', size: 24, weight: '700' })
  text(ctx, truncate(studentQrName(student), 34), W / 2, 794, { color: '#FFFFFF', size: 20, weight: '500' })
  text(ctx, truncate(student.program_and_year, 40), W / 2, 826, { color: '#8B949E', size: 15 })

  text(ctx, 'TANGUB CITY GLOBAL COLLEGE', W / 2, 848, { color: '#8B949E', size: 12, weight: '600' })
  text(ctx, 'SDG 16 · PEACE, JUSTICE & STRONG INSTITUTIONS', W / 2, 866, { color: '#6E7681', size: 10 })

  return canvas.toDataURL('image/png')
}
