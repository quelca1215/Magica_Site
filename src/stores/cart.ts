import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { storeConfig } from '@/config/store'
import { PRODUCTS } from '@/data/products'
import type { CartItem, Product } from '@/types/catalog'
import { buildCartOrderMessage, buildWhatsAppUrl } from '@/utils/whatsapp'

const STORAGE_KEY = 'magica_catalog_cart_v1'

interface StoredCartRow {
  productId: string
  quantity: number
}

function loadInitialItems(): CartItem[] {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const productMap = new Map(PRODUCTS.map((p) => [p.id, p]))
    const restored: CartItem[] = []

    for (const entry of parsed) {
      if (
        typeof entry === 'object' &&
        entry !== null &&
        'productId' in entry &&
        'quantity' in entry
      ) {
        const row = entry as StoredCartRow
        const product = productMap.get(String(row.productId))
        const qty = Number(row.quantity)
        if (product && Number.isFinite(qty) && qty > 0) {
          restored.push({ product, quantity: Math.floor(qty) })
        }
      }
    }

    return restored
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(loadInitialItems())
  const isOpen = ref(false)
  const customerName = ref('')
  const orderNote = ref('')
  const toastMessage = ref<string | null>(null)
  const lastAddedAt = ref(0)

  let toastTimer: ReturnType<typeof setTimeout> | undefined

  watch(
    items,
    (currentItems) => {
      if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
        return
      }
      try {
        const serialized: StoredCartRow[] = currentItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        }))
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized))
      } catch {
        // Ignore storage quota or private-mode restrictions
      }
    },
    { deep: true },
  )

  const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  const distinctCount = computed(() => items.value.length)

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  )

  const isEmpty = computed(() => items.value.length === 0)

  const orderMessage = computed(() =>
    buildCartOrderMessage(items.value, subtotal.value, {
      customerName: customerName.value,
      note: orderNote.value,
    }),
  )

  const whatsappOrderUrl = computed(() =>
    buildWhatsAppUrl(storeConfig.whatsappPhone, orderMessage.value),
  )

  function showToast(message: string) {
    toastMessage.value = message
    if (toastTimer) {
      clearTimeout(toastTimer)
    }
    toastTimer = setTimeout(() => {
      toastMessage.value = null
    }, 3200)
  }

  function dismissToast() {
    if (toastTimer) {
      clearTimeout(toastTimer)
    }
    toastMessage.value = null
  }

  function getQuantity(productId: string): number {
    const found = items.value.find((item) => item.product.id === productId)
    return found ? found.quantity : 0
  }

  function addItem(product: Product, quantity: number = 1) {
    const safeQty = Math.max(1, Math.floor(quantity))
    const existing = items.value.find((item) => item.product.id === product.id)

    if (existing) {
      existing.quantity += safeQty
    } else {
      items.value.push({ product, quantity: safeQty })
    }

    lastAddedAt.value = Date.now()
    showToast(`"${product.title}" agregado al carrito`)
  }

  function incrementItem(productId: string) {
    const existing = items.value.find((item) => item.product.id === productId)
    if (existing) {
      existing.quantity += 1
      lastAddedAt.value = Date.now()
    }
  }

  function decrementItem(productId: string) {
    const idx = items.value.findIndex((item) => item.product.id === productId)
    if (idx === -1) return

    const existing = items.value[idx]
    if (!existing) return

    if (existing.quantity > 1) {
      existing.quantity -= 1
    } else {
      items.value.splice(idx, 1)
    }
  }

  function removeItem(productId: string) {
    items.value = items.value.filter((item) => item.product.id !== productId)
  }

  function clearCart() {
    items.value = []
  }

  function openCart() {
    isOpen.value = true
  }

  function closeCart() {
    isOpen.value = false
  }

  return {
    items,
    isOpen,
    customerName,
    orderNote,
    toastMessage,
    lastAddedAt,
    totalItems,
    distinctCount,
    subtotal,
    isEmpty,
    orderMessage,
    whatsappOrderUrl,
    getQuantity,
    addItem,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    openCart,
    closeCart,
    dismissToast,
  }
})
