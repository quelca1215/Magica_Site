<script setup lang="ts">
import { computed, ref } from 'vue'
import CatalogFilters from '@/components/CatalogFilters.vue'
import HeroSection from '@/components/HeroSection.vue'
import ProductDetailModal from '@/components/ProductDetailModal.vue'
import ProductGrid from '@/components/ProductGrid.vue'
import { CATEGORY_MAP, PRODUCT_CATEGORIES, PRODUCTS } from '@/data/products'
import type { Product, ProductCategoryId, SortOption } from '@/types/catalog'
import { normalizeText } from '@/utils/whatsapp'

const searchQuery = ref('')
const selectedCategory = ref<'all' | ProductCategoryId>('all')
const sortBy = ref<SortOption>('featured')
const selectedProduct = ref<Product | null>(null)

const categoryCounts = computed<Record<ProductCategoryId, number>>(() => {
  const counts: Record<ProductCategoryId, number> = {
    velas: 0,
    accesorios: 0,
    skincare: 0,
    hogar: 0,
  }
  for (const product of PRODUCTS) {
    counts[product.type] += 1
  }
  return counts
})

const filteredProducts = computed<Product[]>(() => {
  const normalizedQuery = normalizeText(searchQuery.value)

  const matching = PRODUCTS.filter((product) => {
    const matchesCategory =
      selectedCategory.value === 'all' || product.type === selectedCategory.value

    if (!matchesCategory) return false
    if (!normalizedQuery) return true

    const categoryLabel = CATEGORY_MAP[product.type].label
    const searchable = normalizeText(
      `${product.title} ${product.shortDescription} ${product.fullDescription} ${categoryLabel}`,
    )
    return searchable.includes(normalizedQuery)
  })

  if (sortBy.value === 'price-asc') {
    return [...matching].sort((a, b) => a.price - b.price)
  }

  if (sortBy.value === 'price-desc') {
    return [...matching].sort((a, b) => b.price - a.price)
  }

  return [...matching].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
})

const hasActiveFilters = computed(
  () =>
    searchQuery.value.trim() !== '' ||
    selectedCategory.value !== 'all' ||
    sortBy.value !== 'featured',
)

function resetFilters() {
  searchQuery.value = ''
  selectedCategory.value = 'all'
  sortBy.value = 'featured'
}
</script>

<template>
  <div class="catalog-page">
    <HeroSection :total-products="PRODUCTS.length" :total-categories="PRODUCT_CATEGORIES.length" />

    <section id="catalogo" class="catalog-section">
      <div class="container catalog-section__inner">
        <div class="catalog-heading">
          <div>
            <span class="catalog-heading__eyebrow">Colección</span>
            <h2 class="catalog-heading__title">Explora por categoría</h2>
          </div>
          <p class="catalog-heading__hint">
            Añade varios productos al carrito o solicita un artículo directo por WhatsApp.
          </p>
        </div>

        <CatalogFilters
          v-model:search-query="searchQuery"
          v-model:selected-category="selectedCategory"
          v-model:sort-by="sortBy"
          :categories="PRODUCT_CATEGORIES"
          :category-counts="categoryCounts"
          :total-products="PRODUCTS.length"
          :filtered-count="filteredProducts.length"
          @reset="resetFilters"
        />

        <ProductGrid
          :products="filteredProducts"
          :has-active-filters="hasActiveFilters"
          @open-detail="selectedProduct = $event"
          @reset-filters="resetFilters"
        />
      </div>
    </section>

    <ProductDetailModal :product="selectedProduct" @close="selectedProduct = null" />
  </div>
</template>

<style scoped>
.catalog-section {
  padding: clamp(2.25rem, 5vw, 3.75rem) 0 clamp(3.5rem, 7vw, 5rem);
  scroll-margin-top: calc(var(--header-height) + 1.25rem);
}

.catalog-section__inner {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.catalog-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
}

.catalog-heading__eyebrow {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: var(--radius-pill);
  background: var(--color-3);
  color: var(--color-5);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  margin-bottom: 0.45rem;
}

.catalog-heading__title {
  font-size: clamp(1.45rem, 2.6vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ink-primary);
}

.catalog-heading__hint {
  font-size: 0.9rem;
  color: var(--ink-secondary);
}
</style>
