<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { CategoryDefinition, ProductCategoryId, SortOption } from '@/types/catalog'

interface Props {
  searchQuery: string
  selectedCategory: 'all' | ProductCategoryId
  sortBy: SortOption
  categories: CategoryDefinition[]
  categoryCounts: Record<ProductCategoryId, number>
  totalProducts: number
  filteredCount: number
}

defineProps<Props>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:selectedCategory': [value: 'all' | ProductCategoryId]
  'update:sortBy': [value: SortOption]
  reset: []
}>()

const searchInputRef = ref<HTMLInputElement | null>(null)

function onSearchInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:searchQuery', target.value)
}

function onSortChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:sortBy', target.value as SortOption)
}

function handleGlobalShortcut(event: KeyboardEvent) {
  if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
  const activeTag = document.activeElement?.tagName
  if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return
  event.preventDefault()
  searchInputRef.value?.focus()
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalShortcut)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalShortcut)
})
</script>

<template>
  <div role="search" class="catalog-filters" aria-label="Buscar y filtrar productos">
    <div class="filters-top">
      <div class="search-field">
        <svg
          class="search-field__icon"
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
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>

        <label for="catalog-search-input" class="sr-only">Buscar productos</label>
        <input
          id="catalog-search-input"
          ref="searchInputRef"
          :value="searchQuery"
          type="search"
          class="search-field__input"
          placeholder="Buscar por nombre, tipo o descripción..."
          autocomplete="off"
          @input="onSearchInput"
        />

        <button
          v-if="searchQuery"
          type="button"
          class="search-field__clear"
          aria-label="Limpiar búsqueda"
          @click="emit('update:searchQuery', '')"
        >
          <svg
            width="15"
            height="15"
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
        <kbd v-else class="search-field__shortcut" aria-hidden="true">/</kbd>
      </div>

      <div class="sort-control">
        <label for="catalog-sort-select" class="sort-control__label">Ordenar</label>
        <select
          id="catalog-sort-select"
          :value="sortBy"
          class="sort-control__select"
          @change="onSortChange"
        >
          <option value="featured">Destacados</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
        </select>
      </div>
    </div>

    <div class="filters-bottom">
      <div class="category-pills" role="group" aria-label="Filtrar por tipo de producto">
        <button
          type="button"
          class="category-pill"
          :class="{ 'is-active': selectedCategory === 'all' }"
          :aria-pressed="selectedCategory === 'all'"
          @click="emit('update:selectedCategory', 'all')"
        >
          <span class="category-pill__dot category-pill__dot--all" aria-hidden="true"></span>
          <span>Todos</span>
          <span class="category-pill__count tabular-nums">{{ totalProducts }}</span>
        </button>

        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          class="category-pill"
          :class="{ 'is-active': selectedCategory === cat.id }"
          :aria-pressed="selectedCategory === cat.id"
          @click="emit('update:selectedCategory', cat.id)"
        >
          <span class="category-pill__dot" aria-hidden="true"></span>
          <span>{{ cat.label }}</span>
          <span class="category-pill__count tabular-nums">{{ categoryCounts[cat.id] }}</span>
        </button>
      </div>

      <div class="results-meta" aria-live="polite">
        <span>
          Mostrando <strong class="tabular-nums">{{ filteredCount }}</strong> de
          <strong class="tabular-nums">{{ totalProducts }}</strong>
        </span>
        <button
          v-if="searchQuery || selectedCategory !== 'all' || sortBy !== 'featured'"
          type="button"
          class="results-meta__reset"
          @click="emit('reset')"
        >
          Restablecer
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.catalog-filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.15rem;
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-card);
}

.filters-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.9rem;
  flex-wrap: wrap;
}

.search-field {
  position: relative;
  flex: 1 1 320px;
  display: flex;
  align-items: center;
}

.search-field__icon {
  position: absolute;
  left: 1rem;
  color: var(--ink-muted);
  pointer-events: none;
}

.search-field__input {
  width: 100%;
  height: 46px;
  padding: 0 2.75rem 0 2.8rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-subtle);
  background: var(--color-2);
  font-size: 0.94rem;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-field__input:focus {
  outline: none;
  background: var(--color-1);
  border-color: var(--color-4);
  box-shadow: 0 0 0 3px var(--color-3);
}

.search-field__input::placeholder {
  color: var(--ink-muted);
}

.search-field__input::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
}

.search-field__clear {
  position: absolute;
  right: 0.7rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-secondary);
  background: var(--bg-subtle);
  transition: background-color 0.15s ease;
}

.search-field__clear:hover {
  background: var(--color-3);
  color: var(--color-5);
}

.search-field__shortcut {
  position: absolute;
  right: 0.9rem;
  padding: 0.12rem 0.45rem;
  border-radius: 6px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  color: var(--ink-muted);
  font-size: 0.72rem;
  font-weight: 600;
  pointer-events: none;
}

.sort-control {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.sort-control__label {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--ink-secondary);
}

.sort-control__select {
  height: 46px;
  padding: 0 1rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-subtle);
  background: var(--color-2);
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--ink-primary);
  cursor: pointer;
}

.sort-control__select:focus {
  outline: none;
  background: var(--color-1);
  border-color: var(--color-4);
  box-shadow: 0 0 0 3px var(--color-3);
}

.filters-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.9rem;
  flex-wrap: wrap;
}

.category-pills {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.48rem;
  padding: 0.48rem 0.85rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-subtle);
  background: var(--color-2);
  color: var(--ink-secondary);
  font-size: 0.86rem;
  font-weight: 600;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;
}

.category-pill:hover {
  border-color: var(--color-4);
  color: var(--ink-primary);
  transform: translateY(-1px);
}

.category-pill.is-active {
  background: var(--color-5);
  border-color: var(--color-5);
  color: var(--color-1);
}

.category-pill__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-4);
  transition: background-color 0.2s ease;
}

.category-pill__dot--all {
  background: var(--color-3);
}

.category-pill.is-active .category-pill__dot {
  background: var(--color-3);
}

.category-pill__count {
  font-size: 0.76rem;
  opacity: 0.78;
}

.results-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.84rem;
  color: var(--ink-secondary);
}

.results-meta__reset {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-5);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.results-meta__reset:hover {
  opacity: 0.72;
}
</style>
