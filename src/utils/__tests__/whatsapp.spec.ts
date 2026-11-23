import { describe, expect, it } from 'vitest'
import { PRODUCTS } from '@/data/products'
import {
  buildCartOrderMessage,
  buildSingleProductMessage,
  buildWhatsAppUrl,
  formatPrice,
  normalizeText,
  sanitizePhone,
} from '@/utils/whatsapp'

describe('whatsapp & catalog utils', () => {
  it('normalizes accents and case for search matching', () => {
    expect(normalizeText('  Sérum Luminoso Rosa Mosqueta  ')).toBe('serum luminoso rosa mosqueta')
    expect(normalizeText('Peonía Ámbar')).toBe('peonia ambar')
  })

  it('sanitizes phone numbers to digits only', () => {
    expect(sanitizePhone('+57 300-123 4567')).toBe('573001234567')
  })

  it('formats prices cleanly without trailing .00 on whole numbers', () => {
    const formatted = formatPrice(24, 'es-US', 'USD')
    expect(formatted).toContain('24')
  })

  it('builds a single product WhatsApp message', () => {
    const product = PRODUCTS[0]!
    const message = buildSingleProductMessage(product, 2, 'Sofía')

    expect(message).toContain(`2x ${product.title}`)
    expect(message).toContain('*Nombre:* Sofía')
    expect(message).toContain('*Total estimado:*')
  })

  it('builds a bundled cart WhatsApp message for multiple items with notes', () => {
    const first = PRODUCTS[0]!
    const second = PRODUCTS[2]!
    const message = buildCartOrderMessage(
      [
        { product: first, quantity: 1 },
        { product: second, quantity: 2 },
      ],
      first.price + second.price * 2,
      { customerName: 'Camila', note: 'Para regalo' },
    )

    expect(message).toContain(first.title)
    expect(message).toContain(`2x ${second.title}`)
    expect(message).toContain('*Nombre:* Camila')
    expect(message).toContain('*Nota de entrega:* Para regalo')
  })

  it('builds a valid wa.me URL with encoded text', () => {
    const url = buildWhatsAppUrl('+57 300 111 2233', 'Hola Mágica')
    expect(url).toBe('https://wa.me/573001112233?text=Hola%20M%C3%A1gica')
  })
})
