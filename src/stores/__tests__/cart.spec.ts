import { nextTick } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { PRODUCTS } from '@/data/products'
import { useCartStore } from '@/stores/cart'

describe('useCartStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('adds items, increments/decrements quantities, and removes at zero', () => {
    const cart = useCartStore()
    const candle = PRODUCTS[0]!
    const necklace = PRODUCTS[2]!

    cart.addItem(candle, 1)
    cart.addItem(necklace, 2)

    expect(cart.totalItems).toBe(3)
    expect(cart.distinctCount).toBe(2)
    expect(cart.subtotal).toBe(candle.price + necklace.price * 2)

    cart.incrementItem(candle.id)
    expect(cart.getQuantity(candle.id)).toBe(2)

    cart.decrementItem(candle.id)
    expect(cart.getQuantity(candle.id)).toBe(1)

    cart.decrementItem(candle.id)
    expect(cart.getQuantity(candle.id)).toBe(0)
    expect(cart.distinctCount).toBe(1)
  })

  it('generates a WhatsApp order link reflecting cart items and clears cart', () => {
    const cart = useCartStore()
    const serum = PRODUCTS[4]!
    cart.customerName = 'Valeria'
    cart.addItem(serum, 2)

    expect(cart.whatsappOrderUrl).toContain('https://wa.me/')
    expect(decodeURIComponent(cart.whatsappOrderUrl)).toContain(serum.title)
    expect(decodeURIComponent(cart.whatsappOrderUrl)).toContain('Valeria')

    cart.clearCart()
    expect(cart.isEmpty).toBe(true)
    expect(cart.totalItems).toBe(0)
  })

  it('persists cart items in localStorage', async () => {
    const cart = useCartStore()
    const cup = PRODUCTS[6]!
    cart.addItem(cup, 2)

    await nextTick()
    const saved = localStorage.getItem('magica_catalog_cart_v1')
    expect(saved).toBeTruthy()
    expect(saved).toContain(cup.id)

    setActivePinia(createPinia())
    const hydratedCart = useCartStore()
    expect(hydratedCart.getQuantity(cup.id)).toBe(2)
  })
})
