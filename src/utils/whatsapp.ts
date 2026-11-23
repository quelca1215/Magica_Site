import { storeConfig } from '@/config/store'
import type { CartItem, Product } from '@/types/catalog'

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function formatPrice(
  amount: number,
  locale: string = storeConfig.locale,
  currency: string = storeConfig.currency,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function buildSingleProductMessage(
  product: Product,
  quantity: number = 1,
  customerName?: string,
): string {
  const safeQty = Math.max(1, Math.floor(quantity))
  const total = product.price * safeQty
  const lines: string[] = [
    `Hola *${storeConfig.brandName}*, me gustaría solicitar este producto:`,
    '',
    `• ${safeQty}x ${product.title} — ${formatPrice(product.price)} c/u (Subtotal: ${formatPrice(total)})`,
    '',
    `*Total estimado:* ${formatPrice(total)}`,
  ]

  const trimmedName = customerName?.trim()
  if (trimmedName) {
    lines.push(`*Nombre:* ${trimmedName}`)
  }

  lines.push('', '¿Me confirmas disponibilidad y métodos de pago? ¡Gracias!')
  return lines.join('\n')
}

export function buildCartOrderMessage(
  items: CartItem[],
  total: number,
  options?: { customerName?: string; note?: string },
): string {
  if (items.length === 0) {
    return `Hola *${storeConfig.brandName}*, me gustaría consultar sobre los productos de tu catálogo.`
  }

  if (items.length === 1) {
    const onlyItem = items[0]
    if (onlyItem) {
      const base = buildSingleProductMessage(
        onlyItem.product,
        onlyItem.quantity,
        options?.customerName,
      )
      const trimmedNote = options?.note?.trim()
      if (!trimmedNote) {
        return base
      }
      return `${base}\n*Nota:* ${trimmedNote}`
    }
  }

  const lines: string[] = [
    `Hola *${storeConfig.brandName}*, quiero realizar el siguiente pedido del catálogo:`,
    '',
  ]

  for (const item of items) {
    const lineTotal = item.product.price * item.quantity
    lines.push(
      `• ${item.quantity}x ${item.product.title} (${formatPrice(item.product.price)} c/u) = ${formatPrice(lineTotal)}`,
    )
  }

  lines.push('', `*Total estimado:* ${formatPrice(total)}`)

  const trimmedName = options?.customerName?.trim()
  if (trimmedName) {
    lines.push(`*Nombre:* ${trimmedName}`)
  }

  const trimmedNote = options?.note?.trim()
  if (trimmedNote) {
    lines.push(`*Nota de entrega:* ${trimmedNote}`)
  }

  lines.push('', '¿Me confirmas disponibilidad para coordinar la compra? ¡Gracias!')
  return lines.join('\n')
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = sanitizePhone(phone)
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
