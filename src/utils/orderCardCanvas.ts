import { storeConfig } from '@/config/store'
import { CATEGORY_MAP } from '@/data/products'
import type { CartItem } from '@/types/catalog'
import { formatPrice } from '@/utils/whatsapp'

const CARD_WIDTH = 960
const CARD_PADDING = 48
const CONTENT_WIDTH = CARD_WIDTH - CARD_PADDING * 2
const HEADER_HEIGHT = 148
const GRID_GAP = 24
const PHOTO_HEIGHT = 220
const CARD_HEIGHT = 382
const TOTAL_BAR_HEIGHT = 86
const FOOTER_HEIGHT = 48
const FONT_FAMILY = '"Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, sans-serif'

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined' || !src) {
      resolve(null)
      return
    }

    const img = new Image()
    if (/^https?:\/\//i.test(src)) {
      img.crossOrigin = 'anonymous'
    }
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function traceRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

function traceTopRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height)
  ctx.lineTo(x, y + height)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawCoverPhotoTop(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const imgRatio = img.naturalWidth / Math.max(1, img.naturalHeight)
  const boxRatio = width / Math.max(1, height)

  let sx = 0
  let sy = 0
  let sWidth = img.naturalWidth
  let sHeight = img.naturalHeight

  if (imgRatio > boxRatio) {
    sWidth = img.naturalHeight * boxRatio
    sx = (img.naturalWidth - sWidth) / 2
  } else {
    sHeight = img.naturalWidth / boxRatio
    sy = (img.naturalHeight - sHeight) / 2
  }

  ctx.save()
  traceTopRoundedRect(ctx, x, y, width, height, radius)
  ctx.clip()
  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, width, height)
  ctx.restore()
}

function drawFallbackPhotoTop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  label: string,
) {
  ctx.save()
  traceTopRoundedRect(ctx, x, y, width, height, radius)
  const grad = ctx.createLinearGradient(x, y, x + width, y + height)
  grad.addColorStop(0, '#FFD6E0')
  grad.addColorStop(1, '#C3B1E1')
  ctx.fillStyle = grad
  ctx.fill()

  ctx.fillStyle = '#4A4E69'
  ctx.font = `700 40px ${FONT_FAMILY}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label.slice(0, 2).toUpperCase() || 'M', x + width / 2, y + height / 2)
  ctx.restore()
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate
    } else {
      if (current) {
        lines.push(current)
      }
      current = word
      if (lines.length === maxLines) break
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current)
  }

  const lastIndex = lines.length - 1
  if (lastIndex >= 0 && words.join(' ').length > lines.join(' ').length) {
    let trimmed = lines[lastIndex] ?? ''
    while (trimmed.length > 3 && ctx.measureText(`${trimmed}...`).width > maxWidth) {
      trimmed = trimmed.slice(0, -1).trimEnd()
    }
    lines[lastIndex] = `${trimmed}...`
  }

  return lines
}

export async function generateOrderCardBlob(
  items: CartItem[],
  total: number,
  options?: { customerName?: string; note?: string },
): Promise<Blob> {
  if (typeof document === 'undefined') {
    throw new Error('Canvas no disponible fuera del navegador')
  }

  const customerName = options?.customerName?.trim() || ''
  const orderNote = options?.note?.trim() || ''
  const hasCustomerInfo = Boolean(customerName || orderNote)

  const measureCanvas = document.createElement('canvas')
  const measureCtx = measureCanvas.getContext('2d')
  let noteLines: string[] = []
  if (orderNote && measureCtx) {
    measureCtx.font = `500 18px ${FONT_FAMILY}`
    noteLines = wrapTextLines(measureCtx, orderNote, CONTENT_WIDTH - 48, 3)
  } else if (orderNote) {
    noteLines = [orderNote]
  }

  const customerBlockHeight = hasCustomerInfo
    ? 34 + (customerName ? 32 : 0) + (noteLines.length > 0 ? 26 + noteLines.length * 24 : 0)
    : 0

  const isSingleItem = items.length === 1
  const columns = isSingleItem ? 1 : 2
  const rows = items.length > 0 ? Math.ceil(items.length / columns) : 0
  const gridHeight = rows > 0 ? rows * CARD_HEIGHT + (rows - 1) * GRID_GAP : 0

  const totalHeight =
    CARD_PADDING +
    HEADER_HEIGHT +
    24 +
    gridHeight +
    (hasCustomerInfo ? 24 + customerBlockHeight : 0) +
    26 +
    TOTAL_BAR_HEIGHT +
    FOOTER_HEIGHT +
    CARD_PADDING

  const canvas = document.createElement('canvas')
  canvas.width = CARD_WIDTH
  canvas.height = totalHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('No se pudo inicializar el contexto 2D del canvas')
  }

  const [logoImg, ...productImages] = await Promise.all([
    loadImage(storeConfig.logoImageUrl),
    ...items.map((item) => loadImage(item.product.image)),
  ])

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, totalHeight)
  bgGrad.addColorStop(0, '#FFF4E6')
  bgGrad.addColorStop(0.5, '#FFFFFF')
  bgGrad.addColorStop(1, '#FFF4E6')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, CARD_WIDTH, totalHeight)

  // Soft pastel glows
  const pinkGlow = ctx.createRadialGradient(CARD_WIDTH * 0.5, 90, 20, CARD_WIDTH * 0.5, 90, 380)
  pinkGlow.addColorStop(0, 'rgba(255, 214, 224, 0.55)')
  pinkGlow.addColorStop(1, 'rgba(255, 214, 224, 0)')
  ctx.fillStyle = pinkGlow
  ctx.fillRect(0, 0, CARD_WIDTH, 470)

  const lavenderGlow = ctx.createRadialGradient(
    CARD_WIDTH * 0.8,
    totalHeight - 120,
    20,
    CARD_WIDTH * 0.8,
    totalHeight - 120,
    360,
  )
  lavenderGlow.addColorStop(0, 'rgba(195, 177, 225, 0.34)')
  lavenderGlow.addColorStop(1, 'rgba(195, 177, 225, 0)')
  ctx.fillStyle = lavenderGlow
  ctx.fillRect(0, Math.max(0, totalHeight - 480), CARD_WIDTH, 480)

  // Minimalist centered header
  const headerY = CARD_PADDING
  const logoSize = 76
  const logoX = (CARD_WIDTH - logoSize) / 2
  const logoY = headerY

  ctx.save()
  ctx.shadowColor = 'rgba(74, 78, 105, 0.14)'
  ctx.shadowBlur = 20
  ctx.shadowOffsetY = 6
  ctx.beginPath()
  ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.fillStyle = '#FFFFFF'
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.beginPath()
  ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.lineWidth = 3.5
  ctx.strokeStyle = '#FFD6E0'
  ctx.stroke()
  if (logoImg) {
    ctx.clip()
    const minSide = Math.min(logoImg.naturalWidth, logoImg.naturalHeight)
    const sx = (logoImg.naturalWidth - minSide) / 2
    const sy = (logoImg.naturalHeight - minSide) / 2
    ctx.drawImage(logoImg, sx, sy, minSide, minSide, logoX, logoY, logoSize, logoSize)
  } else {
    ctx.fillStyle = '#4A4E69'
    ctx.font = `700 28px ${FONT_FAMILY}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(storeConfig.logoMonogram, logoX + logoSize / 2, logoY + logoSize / 2)
  }
  ctx.restore()

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#4A4E69'
  ctx.font = `800 28px ${FONT_FAMILY}`
  ctx.fillText(storeConfig.brandName, CARD_WIDTH / 2, logoY + logoSize + 34)

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtitle = `RESUMEN DE PEDIDO · ${totalCount} ${totalCount === 1 ? 'ARTÍCULO' : 'ARTÍCULOS'}`
  ctx.fillStyle = 'rgba(74, 78, 105, 0.68)'
  ctx.font = `700 14px ${FONT_FAMILY}`
  ctx.fillText(subtitle, CARD_WIDTH / 2, logoY + logoSize + 58)

  // Product photo cards grid
  const gridStartY = headerY + HEADER_HEIGHT + 24
  const cardWidth = isSingleItem ? 500 : (CONTENT_WIDTH - GRID_GAP) / 2

  items.forEach((item, index) => {
    const row = Math.floor(index / columns)
    const col = index % columns
    const cardX = isSingleItem
      ? (CARD_WIDTH - cardWidth) / 2
      : CARD_PADDING + col * (cardWidth + GRID_GAP)
    const cardY = gridStartY + row * (CARD_HEIGHT + GRID_GAP)

    // Card surface + shadow
    ctx.save()
    ctx.shadowColor = 'rgba(74, 78, 105, 0.09)'
    ctx.shadowBlur = 22
    ctx.shadowOffsetY = 8
    traceRoundedRect(ctx, cardX, cardY, cardWidth, CARD_HEIGHT, 22)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
    ctx.restore()

    // Photo top
    const img = productImages[index]
    if (img) {
      drawCoverPhotoTop(ctx, img, cardX, cardY, cardWidth, PHOTO_HEIGHT, 22)
    } else {
      drawFallbackPhotoTop(ctx, cardX, cardY, cardWidth, PHOTO_HEIGHT, 22, item.product.title)
    }

    // Card border on top of photo edge
    traceRoundedRect(ctx, cardX, cardY, cardWidth, CARD_HEIGHT, 22)
    ctx.strokeStyle = 'rgba(74, 78, 105, 0.12)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Floating quantity badge top-right of photo
    const qtyLabel = `×${item.quantity}`
    ctx.font = `800 16px ${FONT_FAMILY}`
    const badgeW = Math.max(54, ctx.measureText(qtyLabel).width + 26)
    const badgeH = 34
    const badgeX = cardX + cardWidth - badgeW - 14
    const badgeY = cardY + 14

    ctx.save()
    ctx.shadowColor = 'rgba(74, 78, 105, 0.25)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetY = 4
    traceRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 17)
    ctx.fillStyle = '#4A4E69'
    ctx.fill()
    ctx.restore()

    ctx.fillStyle = '#FFF4E6'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(qtyLabel, badgeX + badgeW / 2, badgeY + badgeH / 2)

    // Card body
    const bodyX = cardX + 20
    const bodyWidth = cardWidth - 40
    const catY = cardY + PHOTO_HEIGHT + 18

    const categoryLabel = (CATEGORY_MAP[item.product.type]?.label ?? item.product.type).toUpperCase()
    ctx.font = `700 12px ${FONT_FAMILY}`
    const catPillW = Math.min(bodyWidth, ctx.measureText(categoryLabel).width + 20)
    traceRoundedRect(ctx, bodyX, catY, catPillW, 24, 12)
    ctx.fillStyle = '#FFD6E0'
    ctx.fill()

    ctx.fillStyle = '#4A4E69'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(categoryLabel, bodyX + 10, catY + 12)

    // Title (up to 2 lines)
    ctx.fillStyle = '#4A4E69'
    ctx.font = `700 20px ${FONT_FAMILY}`
    ctx.textBaseline = 'alphabetic'
    const titleLines = wrapTextLines(ctx, item.product.title, bodyWidth, 2)
    titleLines.forEach((line, lineIdx) => {
      ctx.fillText(line, bodyX, catY + 52 + lineIdx * 25)
    })

    // Divider line
    const priceRowY = cardY + CARD_HEIGHT - 22
    ctx.beginPath()
    ctx.moveTo(bodyX, priceRowY - 26)
    ctx.lineTo(bodyX + bodyWidth, priceRowY - 26)
    ctx.strokeStyle = 'rgba(74, 78, 105, 0.1)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Unit price left & subtotal right
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(74, 78, 105, 0.68)'
    ctx.font = `600 15px ${FONT_FAMILY}`
    ctx.fillText(`${formatPrice(item.product.price)} c/u`, bodyX, priceRowY)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#4A4E69'
    ctx.font = `800 22px ${FONT_FAMILY}`
    ctx.fillText(formatPrice(item.product.price * item.quantity), bodyX + bodyWidth, priceRowY)
  })

  let cursorY = gridStartY + gridHeight

  // Optional customer / note card
  if (hasCustomerInfo) {
    cursorY += 24
    traceRoundedRect(ctx, CARD_PADDING, cursorY, CONTENT_WIDTH, customerBlockHeight, 18)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(195, 177, 225, 0.7)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    let textCursorY = cursorY + 32
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'

    if (customerName) {
      ctx.fillStyle = '#4A4E69'
      ctx.font = `700 18px ${FONT_FAMILY}`
      ctx.fillText(`Cliente: ${customerName}`, CARD_PADDING + 24, textCursorY)
      textCursorY += 32
    }

    if (noteLines.length > 0) {
      ctx.fillStyle = 'rgba(74, 78, 105, 0.72)'
      ctx.font = `700 15px ${FONT_FAMILY}`
      ctx.fillText('Nota de entrega:', CARD_PADDING + 24, textCursorY)
      textCursorY += 24
      ctx.fillStyle = '#4A4E69'
      ctx.font = `500 18px ${FONT_FAMILY}`
      noteLines.forEach((line) => {
        ctx.fillText(line, CARD_PADDING + 24, textCursorY)
        textCursorY += 24
      })
    }

    cursorY += customerBlockHeight + 26
  } else {
    cursorY += 26
  }

  // Final Total Bar
  ctx.save()
  ctx.shadowColor = 'rgba(74, 78, 105, 0.22)'
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 8
  traceRoundedRect(ctx, CARD_PADDING, cursorY, CONTENT_WIDTH, TOTAL_BAR_HEIGHT, 20)
  ctx.fillStyle = '#4A4E69'
  ctx.fill()
  ctx.restore()

  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#FFF4E6'
  ctx.font = `700 20px ${FONT_FAMILY}`
  ctx.fillText('TOTAL ESTIMADO', CARD_PADDING + 28, cursorY + TOTAL_BAR_HEIGHT / 2)

  ctx.textAlign = 'right'
  ctx.fillStyle = '#FFD6E0'
  ctx.font = `800 34px ${FONT_FAMILY}`
  ctx.fillText(
    formatPrice(total),
    CARD_PADDING + CONTENT_WIDTH - 28,
    cursorY + TOTAL_BAR_HEIGHT / 2,
  )

  // Footer tagline
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(74, 78, 105, 0.65)'
  ctx.font = `600 15px ${FONT_FAMILY}`
  ctx.fillText(
    `${storeConfig.brandName} · ${storeConfig.tagline}`,
    CARD_WIDTH / 2,
    cursorY + TOTAL_BAR_HEIGHT + 28,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('No se pudo exportar la imagen del pedido'))
      }
    }, 'image/png')
  })
}

export async function copyBlobToClipboard(blob: Blob): Promise<boolean> {
  if (
    typeof navigator === 'undefined' ||
    !navigator.clipboard ||
    typeof navigator.clipboard.write !== 'function' ||
    typeof ClipboardItem === 'undefined'
  ) {
    return false
  }

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ])
    return true
  } catch {
    return false
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof document === 'undefined' || typeof URL === 'undefined') return
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 1500)
}

export async function shareOrDownloadOrderCard(
  blob: Blob,
  text: string,
): Promise<'shared' | 'downloaded'> {
  if (typeof File !== 'undefined' && typeof navigator !== 'undefined' && navigator.share) {
    const file = new File([blob], 'pedido-magica.png', { type: 'image/png' })
    const shareData: ShareData = {
      title: `Pedido · ${storeConfig.brandName}`,
      text,
      files: [file],
    }

    if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share(shareData)
        return 'shared'
      } catch {
        // Fallback to download if share was cancelled or failed
      }
    }
  }

  downloadBlob(blob, 'pedido-magica.png')
  return 'downloaded'
}
