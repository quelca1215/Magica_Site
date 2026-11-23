<script setup lang="ts">
import { computed } from 'vue'
import { storeConfig } from '@/config/store'
import { CATEGORY_MAP } from '@/data/products'
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/types/catalog'
import { buildSingleProductMessage, buildWhatsAppUrl, formatPrice } from '@/utils/whatsapp'

interface Props {
  product: Product
  priority?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  priority: false,
})

const emit = defineEmits<{
  openDetail: [product: Product]
}>()

const cart = useCartStore()

const category = computed(() => CATEGORY_MAP[props.product.type])
const quantityInCart = computed(() => cart.getQuantity(props.product.id))

const singleWhatsAppUrl = computed(() =>
  buildWhatsAppUrl(
    storeConfig.whatsappPhone,
    buildSingleProductMessage(props.product, Math.max(1, quantityInCart.value)),
  ),
)

const badgeToneClass = computed(() => {
  if (props.product.badge === 'Nuevo') return 'badge--secondary'
  return 'badge--accent'
})
</script>

<template>
  <article class="product-card" data-testid="product-card">
    <div class="product-card__media">
      <button
        type="button"
        class="product-card__image-trigger"
        :aria-label="`Ver detalle de ${product.title}`"
        @click="emit('openDetail', product)"
      >
        <img
          :src="product.image"
          :alt="product.title"
          class="product-card__image"
          :loading="priority ? 'eager' : 'lazy'"
          decoding="async"
        />
      </button>

      <span v-if="product.badge" class="product-card__badge" :class="badgeToneClass">
        {{ product.badge }}
      </span>

      <button type="button" class="product-card__quickview" @click="emit('openDetail', product)">
        Ver más
      </button>
    </div>

    <div class="product-card__body">
      <div class="product-card__meta">
        <span class="type-chip">
          {{ category.label }}
        </span>
      </div>

      <h3 class="product-card__title">
        <button type="button" class="product-card__title-btn" @click="emit('openDetail', product)">
          {{ product.title }}
        </button>
      </h3>

      <p class="product-card__description">{{ product.shortDescription }}</p>

      <div class="product-card__price-row">
        <span class="product-card__price tabular-nums">{{ formatPrice(product.price) }}</span>
        <span v-if="quantityInCart > 0" class="product-card__in-cart">En tu carrito</span>
      </div>

      <div class="product-card__actions">
        <button
          v-if="quantityInCart === 0"
          type="button"
          class="btn-add"
          @click="cart.addItem(product, 1)"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M12 11v6" />
            <path d="M9 14h6" />
          </svg>
          <span>Agregar</span>
        </button>

        <div v-else class="qty-stepper" role="group" :aria-label="`Cantidad de ${product.title}`">
          <button
            type="button"
            class="qty-stepper__btn"
            :aria-label="`Quitar una unidad de ${product.title}`"
            @click="cart.decrementItem(product.id)"
          >
            −
          </button>
          <span class="qty-stepper__value tabular-nums">{{ quantityInCart }}</span>
          <button
            type="button"
            class="qty-stepper__btn"
            :aria-label="`Sumar una unidad de ${product.title}`"
            @click="cart.incrementItem(product.id)"
          >
            +
          </button>
        </div>

        <a
          :href="singleWhatsAppUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-whatsapp"
          :title="`Pedir ${product.title} directamente por WhatsApp`"
          :aria-label="`Pedir ${product.title} por WhatsApp`"
        >
          <svg
            width="16"
            height="16"
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
          <span>Pedir</span>
        </a>
      </div>
    </div>
  </article>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition:
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.28s ease,
    border-color 0.28s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-4);
  box-shadow: var(--shadow-card-hover);
}

.product-card__media {
  position: relative;
  aspect-ratio: 3 / 4;
  background: var(--bg-image);
  overflow: hidden;
}

.product-card__image-trigger {
  width: 100%;
  height: 100%;
  display: block;
}

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.product-card:hover .product-card__image {
  transform: scale(1.045);
}

.product-card__badge {
  position: absolute;
  top: 0.8rem;
  left: 0.8rem;
  padding: 0.28rem 0.68rem;
  border-radius: var(--radius-pill);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  pointer-events: none;
}

.badge--accent {
  background: var(--color-3);
  color: var(--color-5);
}

.badge--secondary {
  background: var(--color-4);
  color: var(--color-5);
}

.product-card__quickview {
  position: absolute;
  right: 0.8rem;
  bottom: 0.8rem;
  padding: 0.36rem 0.78rem;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  color: var(--ink-primary);
  font-size: 0.76rem;
  font-weight: 600;
  border: 1px solid var(--border-subtle);
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    background-color 0.2s ease;
}

.product-card:hover .product-card__quickview,
.product-card:focus-within .product-card__quickview {
  opacity: 1;
  transform: translateY(0);
}

.product-card__quickview:hover {
  background: var(--color-3);
  color: var(--color-5);
}

.product-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.1rem 1.15rem 1.2rem;
  gap: 0.55rem;
}

.product-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.type-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.62rem;
  border-radius: var(--radius-pill);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: var(--color-2);
  color: var(--color-5);
}

.product-card__title {
  font-size: 1.04rem;
  font-weight: 700;
  line-height: 1.28;
  color: var(--ink-primary);
}

.product-card__title-btn {
  text-align: left;
  transition: color 0.18s ease;
}

.product-card__title-btn:hover {
  text-decoration: underline;
  text-decoration-color: var(--color-4);
  text-underline-offset: 4px;
}

.product-card__description {
  font-size: 0.87rem;
  line-height: 1.48;
  color: var(--ink-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__price-row {
  margin-top: auto;
  padding-top: 0.35rem;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.product-card__price {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--ink-primary);
}

.product-card__in-cart {
  font-size: 0.74rem;
  font-weight: 600;
  background: var(--color-3);
  color: var(--color-5);
  padding: 0.14rem 0.5rem;
  border-radius: var(--radius-pill);
}

.product-card__actions {
  margin-top: 0.35rem;
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.btn-add {
  flex: 1;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0 0.9rem;
  border-radius: var(--radius-pill);
  background: var(--color-5);
  color: var(--color-1);
  font-size: 0.86rem;
  font-weight: 600;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;
}

.btn-add:hover {
  background: var(--color-3);
  color: var(--color-5);
}

.btn-add:active {
  transform: scale(0.98);
}

.qty-stepper {
  flex: 1;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.3rem;
  border-radius: var(--radius-pill);
  background: var(--color-3);
  border: 1px solid rgba(74, 78, 105, 0.14);
}

.qty-stepper__btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-5);
  transition: background-color 0.15s ease;
}

.qty-stepper__btn:hover {
  background: var(--color-1);
}

.qty-stepper__value {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ink-primary);
}

.btn-whatsapp {
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.38rem;
  padding: 0 0.85rem;
  border-radius: var(--radius-pill);
  background: var(--color-1);
  color: var(--color-5);
  border: 1px solid var(--color-4);
  font-size: 0.83rem;
  font-weight: 700;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.btn-whatsapp:hover {
  background: var(--color-4);
  border-color: var(--color-4);
  color: var(--color-5);
}
</style>
