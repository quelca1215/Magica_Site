<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { gsap, prefersReducedMotion } from '@/composables/useGsap'
import { storeConfig } from '@/config/store'
import { CATEGORY_MAP } from '@/data/products'
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/types/catalog'
import { buildSingleProductMessage, buildWhatsAppUrl, formatPrice } from '@/utils/whatsapp'

interface Props {
  product: Product | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const cart = useCartStore()
const quantity = ref(1)
const panelRef = ref<HTMLElement | null>(null)
let modalCtx: gsap.Context | undefined

const category = computed(() => (props.product ? CATEGORY_MAP[props.product.type] : null))

const directWhatsAppUrl = computed(() => {
  if (!props.product) return '#'
  return buildWhatsAppUrl(
    storeConfig.whatsappPhone,
    buildSingleProductMessage(props.product, quantity.value),
  )
})

function addAndClose() {
  if (!props.product) return
  cart.addItem(props.product, quantity.value)
  emit('close')
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.product) {
    emit('close')
  }
}

watch(
  () => props.product,
  async (current) => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = current ? 'hidden' : ''
    }

    if (current) {
      quantity.value = 1
      await nextTick()
      if (panelRef.value && !prefersReducedMotion()) {
        modalCtx?.revert()
        modalCtx = gsap.context(() => {
          gsap.fromTo(
            panelRef.value,
            { opacity: 0, scale: 0.95, y: 14 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.28,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
            },
          )
        })
      }
    }
  },
)

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}

onUnmounted(() => {
  modalCtx?.revert()
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
  }
  if (typeof document !== 'undefined' && !cart.isOpen) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="product"
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="`modal-title-${product.id}`"
      @click.self="emit('close')"
    >
      <div ref="panelRef" class="modal-panel">
        <button
          type="button"
          class="modal-close"
          aria-label="Cerrar detalle del producto"
          @click="emit('close')"
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

        <div class="modal-grid">
          <div class="modal-media">
            <img :src="product.image" :alt="product.title" class="modal-media__img" />
          </div>

          <div class="modal-body">
            <div class="modal-badges">
              <span v-if="category" class="type-chip">
                {{ category.label }}
              </span>
              <span v-if="product.badge" class="modal-badge-note">{{ product.badge }}</span>
            </div>

            <h2 :id="`modal-title-${product.id}`" class="modal-title">{{ product.title }}</h2>

            <p class="modal-price tabular-nums">{{ formatPrice(product.price) }}</p>

            <p class="modal-description">{{ product.fullDescription }}</p>

            <div class="modal-qty-row">
              <span class="modal-qty-label">Cantidad</span>
              <div class="qty-picker">
                <button
                  type="button"
                  class="qty-picker__btn"
                  aria-label="Disminuir cantidad"
                  @click="quantity = Math.max(1, quantity - 1)"
                >
                  −
                </button>
                <span class="qty-picker__value tabular-nums">{{ quantity }}</span>
                <button
                  type="button"
                  class="qty-picker__btn"
                  aria-label="Aumentar cantidad"
                  @click="quantity += 1"
                >
                  +
                </button>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="modal-btn-primary" @click="addAndClose">
                Agregar al carrito · {{ formatPrice(product.price * quantity) }}
              </button>

              <a
                :href="directWhatsAppUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="modal-btn-whatsapp"
              >
                <svg
                  width="18"
                  height="18"
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
                <span>Solicitar solo este por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(74, 78, 105, 0.45);
  backdrop-filter: blur(6px);
}

.modal-panel {
  position: relative;
  width: 100%;
  max-width: 780px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 26px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-modal);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--border-subtle);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-primary);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.modal-close:hover {
  background: var(--color-3);
  color: var(--color-5);
}

.modal-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
}

.modal-media {
  background: var(--bg-image);
  aspect-ratio: 3 / 4;
}

.modal-media__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.type-chip {
  display: inline-flex;
  padding: 0.22rem 0.65rem;
  border-radius: var(--radius-pill);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: var(--color-2);
  color: var(--color-5);
}

.modal-badge-note {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-5);
  background: var(--color-4);
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-pill);
}

.modal-title {
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--ink-primary);
}

.modal-price {
  font-size: 1.55rem;
  font-weight: 700;
  color: var(--ink-primary);
}

.modal-description {
  font-size: 0.95rem;
  line-height: 1.62;
  color: var(--ink-secondary);
}

.modal-qty-row {
  margin-top: auto;
  padding-top: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--border-subtle);
}

.modal-qty-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--ink-secondary);
}

.qty-picker {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.25rem 0.4rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-subtle);
  background: var(--bg-canvas);
}

.qty-picker__btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ink-primary);
  transition: background-color 0.15s ease;
}

.qty-picker__btn:hover {
  background: var(--color-3);
  color: var(--color-5);
}

.qty-picker__value {
  min-width: 24px;
  text-align: center;
  font-weight: 700;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.modal-btn-primary {
  height: 46px;
  border-radius: var(--radius-pill);
  background: var(--color-5);
  color: var(--color-1);
  font-size: 0.94rem;
  font-weight: 600;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.modal-btn-primary:hover {
  background: var(--color-4);
  color: var(--color-5);
}

.modal-btn-whatsapp {
  height: 46px;
  border-radius: var(--radius-pill);
  background: var(--color-3);
  color: var(--color-5);
  font-size: 0.92rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;
}

.modal-btn-whatsapp:hover {
  background: var(--color-4);
  color: var(--color-5);
}

@media (max-width: 680px) {
  .modal-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .modal-media {
    max-height: 300px;
  }

  .modal-body {
    padding: 1.35rem;
  }
}
</style>
