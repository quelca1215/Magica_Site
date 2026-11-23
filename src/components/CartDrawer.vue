<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { gsap, prefersReducedMotion } from '@/composables/useGsap'
import { CATEGORY_MAP } from '@/data/products'
import { useCartStore } from '@/stores/cart'
import {
  copyBlobToClipboard,
  downloadBlob,
  generateOrderCardBlob,
  shareOrDownloadOrderCard,
} from '@/utils/orderCardCanvas'
import { formatPrice } from '@/utils/whatsapp'

const cart = useCartStore()
const drawerRef = ref<HTMLElement | null>(null)
const backdropRef = ref<HTMLElement | null>(null)
const copied = ref(false)
const isGeneratingImage = ref(false)
const feedbackMessage = ref<string | null>(null)
const previewImageUrl = ref<string | null>(null)
const previewBlob = ref<Blob | null>(null)
const imageCopied = ref(false)

let drawerCtx: gsap.Context | undefined
let copyTimer: ReturnType<typeof setTimeout> | undefined
let feedbackTimer: ReturnType<typeof setTimeout> | undefined

const whatsappButtonLabel = computed(() => {
  if (isGeneratingImage.value) {
    return 'Preparando tarjetas con fotos...'
  }
  if (cart.totalItems === 1) {
    return 'Preparar pedido con foto para WhatsApp'
  }
  return `Preparar pedido (${cart.totalItems} items) con fotos`
})

function closePreview() {
  if (previewImageUrl.value && typeof URL !== 'undefined') {
    URL.revokeObjectURL(previewImageUrl.value)
  }
  previewImageUrl.value = null
  previewBlob.value = null
  imageCopied.value = false
}

function setFeedback(message: string) {
  feedbackMessage.value = message
  if (feedbackTimer) clearTimeout(feedbackTimer)
  feedbackTimer = setTimeout(() => {
    feedbackMessage.value = null
  }, 6500)
}

async function prepareOrderPreview() {
  if (isGeneratingImage.value || cart.isEmpty) return

  isGeneratingImage.value = true
  try {
    const blob = await generateOrderCardBlob(cart.items, cart.subtotal, {
      customerName: cart.customerName,
      note: cart.orderNote,
    })

    closePreview()
    previewBlob.value = blob
    if (typeof URL !== 'undefined') {
      previewImageUrl.value = URL.createObjectURL(blob)
    }
    imageCopied.value = await copyBlobToClipboard(blob)
  } catch {
    setFeedback('No se pudo generar la tarjeta visual. Puedes abrir WhatsApp directamente.')
    if (typeof window !== 'undefined') {
      window.open(cart.whatsappOrderUrl, '_blank', 'noopener,noreferrer')
    }
  } finally {
    isGeneratingImage.value = false
  }
}

function openWhatsAppFromPreview() {
  if (typeof window !== 'undefined') {
    window.open(cart.whatsappOrderUrl, '_blank', 'noopener,noreferrer')
  }
}

async function handleShareOrDownloadPreview() {
  if (isGeneratingImage.value || cart.isEmpty) return

  isGeneratingImage.value = true
  try {
    const blob =
      previewBlob.value ??
      (await generateOrderCardBlob(cart.items, cart.subtotal, {
        customerName: cart.customerName,
        note: cart.orderNote,
      }))
    const result = await shareOrDownloadOrderCard(blob, cart.orderMessage)
    if (result === 'downloaded') {
      setFeedback('Imagen guardada como "pedido-magica.png" para adjuntar en WhatsApp.')
    }
  } catch {
    setFeedback('No se pudo exportar la imagen en este dispositivo.')
  } finally {
    isGeneratingImage.value = false
  }
}

async function handleDirectDownload() {
  if (isGeneratingImage.value || cart.isEmpty) return

  isGeneratingImage.value = true
  try {
    const blob = await generateOrderCardBlob(cart.items, cart.subtotal, {
      customerName: cart.customerName,
      note: cart.orderNote,
    })
    downloadBlob(blob, 'pedido-magica.png')
    setFeedback('Tarjeta visual descargada como "pedido-magica.png".')
  } catch {
    setFeedback('No se pudo descargar la imagen.')
  } finally {
    isGeneratingImage.value = false
  }
}

async function copySummary() {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return
  try {
    await navigator.clipboard.writeText(cart.orderMessage)
    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copied.value = false
    }, 2200)
  } catch {
    // Clipboard access unavailable
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && cart.isOpen) {
    cart.closeCart()
  }
}

watch(
  () => cart.isOpen,
  async (open) => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = open ? 'hidden' : ''
    }

    if (!open) {
      closePreview()
    } else {
      await nextTick()
      if (prefersReducedMotion()) return

      drawerCtx?.revert()
      drawerCtx = gsap.context(() => {
        if (backdropRef.value) {
          gsap.fromTo(backdropRef.value, { opacity: 0 }, { opacity: 1, duration: 0.24 })
        }
        if (drawerRef.value) {
          gsap.fromTo(
            drawerRef.value,
            { x: '100%' },
            { x: '0%', duration: 0.34, ease: 'power3.out', clearProps: 'transform' },
          )
        }
      })
    }
  },
)

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}

onUnmounted(() => {
  closePreview()
  drawerCtx?.revert()
  if (copyTimer) clearTimeout(copyTimer)
  if (feedbackTimer) clearTimeout(feedbackTimer)
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
  }
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="cart.isOpen" class="drawer-root">
      <div
        ref="backdropRef"
        class="drawer-backdrop"
        aria-hidden="true"
        @click="cart.closeCart()"
      ></div>

      <aside
        ref="drawerRef"
        class="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        <div class="drawer-header">
          <div class="drawer-header__title-group">
            <h2 class="drawer-header__title">Tu Carrito</h2>
            <span class="drawer-header__count tabular-nums">
              {{ cart.totalItems }} {{ cart.totalItems === 1 ? 'artículo' : 'artículos' }}
            </span>
          </div>

          <button
            type="button"
            class="drawer-close"
            aria-label="Cerrar carrito"
            @click="cart.closeCart()"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div v-if="cart.isEmpty" class="drawer-empty">
          <div class="drawer-empty__icon" aria-hidden="true">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h3 class="drawer-empty__title">Tu carrito está vacío</h3>
          <p class="drawer-empty__text">
            Agrega uno o varios productos del catálogo para enviar tu solicitud de compra por
            WhatsApp.
          </p>
          <button type="button" class="drawer-empty__cta" @click="cart.closeCart()">
            Explorar catálogo
          </button>
        </div>

        <template v-else-if="previewImageUrl">
          <div class="drawer-scroll drawer-preview-scroll">
            <div class="preview-header-row">
              <div>
                <h3 class="preview-title">Tarjeta visual de tu pedido</h3>
                <p class="preview-subtitle">
                  {{
                    imageCopied
                      ? 'Imagen copiada al portapapeles. En WhatsApp solo presiona Ctrl+V / Pegar.'
                      : 'Descarga o comparte esta tarjeta para que el vendedor vea las fotos.'
                  }}
                </p>
              </div>
              <button type="button" class="preview-back-btn" @click="closePreview">
                Editar carrito
              </button>
            </div>

            <div class="preview-card-frame">
              <img
                :src="previewImageUrl"
                alt="Vista previa estética del pedido con fotos"
                class="preview-card-img"
              />
            </div>
          </div>

          <div class="drawer-footer">
            <p v-if="feedbackMessage" class="drawer-feedback" role="status" aria-live="polite">
              {{ feedbackMessage }}
            </p>

            <button type="button" class="drawer-whatsapp-cta" @click="openWhatsAppFromPreview">
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path
                  d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                />
              </svg>
              <span>Abrir WhatsApp {{ imageCopied ? '(y pegar imagen)' : '' }}</span>
            </button>

            <div class="drawer-secondary-actions">
              <button
                type="button"
                class="drawer-copy-btn"
                :disabled="isGeneratingImage"
                @click="handleShareOrDownloadPreview"
              >
                Compartir / Guardar imagen
              </button>

              <button type="button" class="drawer-copy-btn" @click="closePreview">
                Volver al carrito
              </button>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="drawer-scroll">
            <ul class="cart-list">
              <li v-for="item in cart.items" :key="item.product.id" class="cart-item">
                <img :src="item.product.image" :alt="item.product.title" class="cart-item__img" />

                <div class="cart-item__info">
                  <div class="cart-item__top">
                    <div>
                      <span class="cart-item__type">
                        {{ CATEGORY_MAP[item.product.type].label }}
                      </span>
                      <h3 class="cart-item__title">{{ item.product.title }}</h3>
                    </div>
                    <button
                      type="button"
                      class="cart-item__remove"
                      :aria-label="`Eliminar ${item.product.title} del carrito`"
                      @click="cart.removeItem(item.product.id)"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>

                  <div class="cart-item__bottom">
                    <div class="cart-stepper">
                      <button
                        type="button"
                        class="cart-stepper__btn"
                        :aria-label="`Reducir cantidad de ${item.product.title}`"
                        @click="cart.decrementItem(item.product.id)"
                      >
                        −
                      </button>
                      <span class="cart-stepper__qty tabular-nums">{{ item.quantity }}</span>
                      <button
                        type="button"
                        class="cart-stepper__btn"
                        :aria-label="`Aumentar cantidad de ${item.product.title}`"
                        @click="cart.incrementItem(item.product.id)"
                      >
                        +
                      </button>
                    </div>

                    <div class="cart-item__prices">
                      <span class="cart-item__unit tabular-nums">
                        {{ formatPrice(item.product.price) }} c/u
                      </span>
                      <strong class="cart-item__line-total tabular-nums">
                        {{ formatPrice(item.product.price * item.quantity) }}
                      </strong>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div class="drawer-footer">
            <div class="drawer-summary">
              <div class="drawer-summary__row">
                <span>Total estimado</span>
                <strong class="drawer-summary__total tabular-nums">
                  {{ formatPrice(cart.subtotal) }}
                </strong>
              </div>
              <button type="button" class="drawer-clear-btn" @click="cart.clearCart()">
                Vaciar carrito
              </button>
            </div>

            <p v-if="feedbackMessage" class="drawer-feedback" role="status" aria-live="polite">
              {{ feedbackMessage }}
            </p>

            <button
              type="button"
              class="drawer-whatsapp-cta"
              :disabled="isGeneratingImage"
              @click="prepareOrderPreview"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path
                  d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                />
              </svg>
              <span>{{ whatsappButtonLabel }}</span>
            </button>

            <div class="drawer-secondary-actions">
              <button
                type="button"
                class="drawer-copy-btn"
                :disabled="isGeneratingImage"
                @click="handleDirectDownload"
              >
                Descargar imagen
              </button>

              <button type="button" class="drawer-copy-btn" @click="copySummary">
                {{ copied ? '¡Texto copiado!' : 'Copiar texto' }}
              </button>
            </div>
          </div>
        </template>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.drawer-root {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: flex;
  justify-content: flex-end;
}

.drawer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(74, 78, 105, 0.42);
  backdrop-filter: blur(5px);
}

.drawer-panel {
  position: relative;
  z-index: 1;
  width: min(100vw, 440px);
  height: 100%;
  background: var(--bg-surface);
  box-shadow: var(--shadow-drawer);
  display: flex;
  flex-direction: column;
}

.drawer-header {
  padding: 1.25rem 1.35rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.drawer-header__title-group {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
}

.drawer-header__title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--ink-primary);
}

.drawer-header__count {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-5);
  background: var(--color-3);
  padding: 0.16rem 0.6rem;
  border-radius: var(--radius-pill);
}

.drawer-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-subtle);
  color: var(--ink-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.drawer-close:hover {
  background: var(--color-3);
  color: var(--color-5);
}

.drawer-empty {
  flex: 1;
  padding: 2.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.85rem;
}

.drawer-empty__icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-3);
  color: var(--color-5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawer-empty__title {
  font-size: 1.1rem;
  font-weight: 700;
}

.drawer-empty__text {
  font-size: 0.9rem;
  color: var(--ink-secondary);
  max-width: 300px;
}

.drawer-empty__cta {
  margin-top: 0.35rem;
  padding: 0.7rem 1.4rem;
  border-radius: var(--radius-pill);
  background: var(--color-5);
  color: var(--color-1);
  font-weight: 600;
  font-size: 0.9rem;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.drawer-empty__cta:hover {
  background: var(--color-3);
  color: var(--color-5);
}

.drawer-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 1.15rem 1.35rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.cart-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.cart-item {
  display: flex;
  gap: 0.85rem;
  padding: 0.8rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--bg-canvas);
}

.cart-item__img {
  width: 68px;
  height: 88px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  background: var(--bg-image);
  flex-shrink: 0;
}

.cart-item__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.6rem;
}

.cart-item__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.cart-item__type {
  display: block;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ink-muted);
}

.cart-item__title {
  font-size: 0.94rem;
  font-weight: 700;
  color: var(--ink-primary);
  line-height: 1.25;
}

.cart-item__remove {
  padding: 0.25rem;
  border-radius: 6px;
  color: var(--ink-muted);
  transition:
    color 0.15s ease,
    background-color 0.15s ease;
}

.cart-item__remove:hover {
  color: var(--color-5);
  background: var(--color-3);
}

.cart-item__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.cart-stepper {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.18rem 0.3rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}

.cart-stepper__btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--ink-primary);
}

.cart-stepper__btn:hover {
  background: var(--color-3);
  color: var(--color-5);
}

.cart-stepper__qty {
  min-width: 18px;
  text-align: center;
  font-size: 0.86rem;
  font-weight: 700;
}

.cart-item__prices {
  text-align: right;
  display: flex;
  flex-direction: column;
}

.cart-item__unit {
  font-size: 0.72rem;
  color: var(--ink-muted);
}

.cart-item__line-total {
  font-size: 0.95rem;
  color: var(--ink-primary);
}

.order-notes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-subtle);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.field-group__label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--ink-secondary);
}

.field-group__input,
.field-group__textarea {
  width: 100%;
  padding: 0.55rem 0.8rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
  background: var(--bg-canvas);
  font-size: 0.88rem;
  resize: vertical;
}

.field-group__input:focus,
.field-group__textarea:focus {
  outline: none;
  background: var(--color-1);
  border-color: var(--color-4);
  box-shadow: 0 0 0 3px var(--color-3);
}

.drawer-footer {
  padding: 1.1rem 1.35rem 1.35rem;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.drawer-summary {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.2rem;
}

.drawer-summary__row {
  display: flex;
  align-items: baseline;
  gap: 0.55rem;
  font-size: 0.92rem;
  color: var(--ink-secondary);
}

.drawer-summary__total {
  font-size: 1.35rem;
  color: var(--ink-primary);
}

.drawer-clear-btn {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ink-muted);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.drawer-clear-btn:hover {
  color: var(--color-5);
}

.drawer-whatsapp-cta {
  height: 48px;
  border-radius: var(--radius-pill);
  background: var(--color-3);
  color: var(--color-5);
  font-size: 0.94rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  box-shadow: 0 10px 22px -8px rgba(74, 78, 105, 0.18);
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;
}

.drawer-whatsapp-cta:hover:not(:disabled) {
  background: var(--color-4);
  color: var(--color-5);
  transform: translateY(-1px);
}

.drawer-whatsapp-cta:disabled {
  opacity: 0.72;
  cursor: wait;
}

.drawer-feedback {
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-sm);
  background: var(--color-2);
  border: 1px solid var(--color-3);
  color: var(--color-5);
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.4;
}

.drawer-secondary-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.drawer-copy-btn {
  height: 40px;
  padding: 0 0.7rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-subtle);
  background: var(--color-2);
  color: var(--color-5);
  font-size: 0.8rem;
  font-weight: 600;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    opacity 0.2s ease;
}

.drawer-copy-btn:hover:not(:disabled) {
  border-color: var(--color-4);
  color: var(--color-5);
}

.drawer-copy-btn:disabled {
  opacity: 0.65;
  cursor: wait;
}

.drawer-preview-scroll {
  gap: 1rem;
}

.preview-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.preview-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--ink-primary);
}

.preview-subtitle {
  margin-top: 0.2rem;
  font-size: 0.8rem;
  color: var(--ink-secondary);
  line-height: 1.4;
}

.preview-back-btn {
  flex-shrink: 0;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-subtle);
  background: var(--bg-canvas);
  color: var(--ink-primary);
  font-size: 0.76rem;
  font-weight: 600;
}

.preview-back-btn:hover {
  border-color: var(--color-4);
  background: var(--color-3);
}

.preview-card-frame {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--bg-canvas);
  padding: 0.5rem;
  box-shadow: var(--shadow-card);
}

.preview-card-img {
  width: 100%;
  height: auto;
  border-radius: calc(var(--radius-md) - 4px);
  display: block;
}
</style>
