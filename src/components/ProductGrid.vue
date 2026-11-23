<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import ProductCard from '@/components/ProductCard.vue'
import { gsap, prefersReducedMotion } from '@/composables/useGsap'
import { useIntro } from '@/composables/useIntro'
import type { Product } from '@/types/catalog'

interface Props {
  products: Product[]
  hasActiveFilters: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  openDetail: [product: Product]
  resetFilters: []
}>()

const gridRef = ref<HTMLElement | null>(null)
const { isIntroRevealed } = useIntro()
let ctx: gsap.Context | undefined

function animateCards(delay = 0) {
  if (!gridRef.value || prefersReducedMotion()) return

  const cards = gridRef.value.querySelectorAll('.product-card-slot')
  if (cards.length === 0) return

  gsap.killTweensOf(cards)

  ctx?.revert()
  ctx = gsap.context(() => {
    gsap.fromTo(
      cards,
      { opacity: 0, y: 22, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.44,
        delay,
        stagger: 0.045,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      },
    )
  }, gridRef.value)
}

onMounted(() => {
  if (isIntroRevealed.value || prefersReducedMotion()) {
    animateCards()
  }
})

watch(isIntroRevealed, async (revealed) => {
  if (revealed) {
    await nextTick()
    animateCards(0.42)
  }
})

watch(
  () => props.products.map((item) => item.id).join(','),
  async () => {
    await nextTick()
    animateCards()
  },
)

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <div v-if="products.length > 0" ref="gridRef" class="product-grid">
    <div v-for="(product, index) in products" :key="product.id" class="product-card-slot">
      <ProductCard
        :product="product"
        :priority="index < 4"
        @open-detail="emit('openDetail', $event)"
      />
    </div>
  </div>

  <div v-else class="empty-state">
    <div class="empty-state__icon" aria-hidden="true">
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
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    </div>
    <h3 class="empty-state__title">No encontramos coincidencias</h3>
    <p class="empty-state__text">
      Prueba con otro término de búsqueda o selecciona otra categoría para explorar el catálogo.
    </p>
    <button
      v-if="hasActiveFilters"
      type="button"
      class="empty-state__btn"
      @click="emit('resetFilters')"
    >
      Limpiar búsqueda y filtros
    </button>
  </div>
</template>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.35rem;
}

.product-card-slot {
  display: flex;
}

.product-card-slot > :deep(*) {
  width: 100%;
}

@media (max-width: 1120px) {
  .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.empty-state {
  padding: 3.5rem 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px dashed var(--border-strong);
  background: var(--bg-surface);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
}

.empty-state__icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-3);
  color: var(--color-5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state__title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--ink-primary);
}

.empty-state__text {
  max-width: 400px;
  font-size: 0.92rem;
  color: var(--ink-secondary);
}

.empty-state__btn {
  margin-top: 0.35rem;
  padding: 0.65rem 1.25rem;
  border-radius: var(--radius-pill);
  background: var(--color-5);
  color: var(--color-1);
  font-size: 0.88rem;
  font-weight: 600;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.empty-state__btn:hover {
  background: var(--color-3);
  color: var(--color-5);
}
</style>
