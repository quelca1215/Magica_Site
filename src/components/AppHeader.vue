<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import BrandLogo from '@/components/BrandLogo.vue'
import { gsap, prefersReducedMotion } from '@/composables/useGsap'
import { useIntro } from '@/composables/useIntro'
import { storeConfig } from '@/config/store'
import { useCartStore } from '@/stores/cart'
import { buildCartOrderMessage, buildWhatsAppUrl, formatPrice } from '@/utils/whatsapp'

const cart = useCartStore()
const headerBarRef = ref<HTMLElement | null>(null)
const badgeRef = ref<HTMLElement | null>(null)
const isScrolled = ref(false)
const { isIntroRevealed } = useIntro()

let headerCtx: gsap.Context | undefined

const generalWhatsAppUrl = computed(() =>
  buildWhatsAppUrl(storeConfig.whatsappPhone, buildCartOrderMessage([], 0)),
)

function handleScroll() {
  if (typeof window === 'undefined') return
  isScrolled.value = window.scrollY > 24
}

function focusSearch() {
  if (typeof document === 'undefined') return
  const catalogSection = document.getElementById('catalogo')
  const searchInput = document.getElementById('catalog-search-input') as HTMLInputElement | null

  catalogSection?.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  })

  if (searchInput) {
    setTimeout(() => {
      searchInput.focus({ preventScroll: true })
    }, 220)
  }
}

onMounted(() => {
  handleScroll()
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll, { passive: true })
  }

  if (headerBarRef.value && !prefersReducedMotion() && isIntroRevealed.value) {
    headerCtx = gsap.context(() => {
      gsap.fromTo(
        headerBarRef.value,
        { y: -14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', clearProps: 'transform,opacity' },
      )
    })
  }
})

watch(isIntroRevealed, async (revealed) => {
  if (!revealed || !headerBarRef.value || prefersReducedMotion()) return

  await nextTick()

  if (!headerCtx) {
    headerCtx = gsap.context(() => {})
  }

  headerCtx.add(() => {
    gsap.fromTo(
      headerBarRef.value,
      { y: -16, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.6,
        delay: 0.35,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
    )
  })
})

onUnmounted(() => {
  headerCtx?.revert()
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleScroll)
  }
})

watch(
  () => cart.lastAddedAt,
  () => {
    if (!badgeRef.value || prefersReducedMotion()) return
    gsap.fromTo(
      badgeRef.value,
      { scale: 1.45 },
      { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.5)', clearProps: 'transform' },
    )
  },
)
</script>

<template>
  <header class="app-header" :class="{ 'is-scrolled': isScrolled, 'is-intro-hidden': !isIntroRevealed }">
    <div ref="headerBarRef" class="app-header__bar">
      <a href="#top" class="brand-link">
        <BrandLogo size="sm" />
        <span class="brand-link__name">{{ storeConfig.brandName }}</span>
      </a>

      <nav class="header-nav" aria-label="Navegación principal">
        <a href="#top" class="header-nav__item">Inicio</a>
        <a href="#catalogo" class="header-nav__item">Catálogo</a>
        <button type="button" class="header-nav__item" @click="focusSearch">Buscar</button>
      </nav>

      <div class="header-actions">
        <button
          type="button"
          class="header-icon-btn header-icon-btn--search"
          aria-label="Buscar productos"
          @click="focusSearch"
        >
          <svg
            width="17"
            height="17"
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
        </button>

        <a
          :href="generalWhatsAppUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="header-icon-btn"
          title="Escribir por WhatsApp"
          aria-label="Escribir por WhatsApp"
        >
          <svg
            width="17"
            height="17"
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
        </a>

        <button
          type="button"
          class="cart-trigger"
          :aria-label="`Abrir carrito de compras (${cart.totalItems} productos)`"
          @click="cart.openCart()"
        >
          <svg
            class="cart-trigger__icon"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.9"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span class="cart-trigger__label">Carrito</span>
          <span v-if="!cart.isEmpty" class="cart-trigger__subtotal tabular-nums">
            {{ formatPrice(cart.subtotal) }}
          </span>
          <span ref="badgeRef" class="cart-trigger__badge tabular-nums">
            {{ cart.totalItems }}
          </span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  pointer-events: none;
  padding: 0.85rem clamp(0.75rem, 3vw, 1.5rem) 0;
}

.app-header__bar {
  pointer-events: auto;
  margin-inline: auto;
  width: 100%;
  max-width: var(--container-max);
  min-height: 62px;
  padding: 0.45rem 0.5rem;
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  transition:
    max-width 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    padding 0.35s ease,
    background-color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.app-header.is-scrolled .app-header__bar {
  max-width: 960px;
  padding: 0.45rem 0.65rem 0.45rem 0.85rem;
  background: rgba(255, 255, 255, 0.68);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border-color: rgba(255, 214, 224, 0.9);
  box-shadow:
    0 12px 32px -12px rgba(74, 78, 105, 0.16),
    0 2px 8px -2px rgba(195, 177, 225, 0.25);
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
}

.brand-link__name {
  font-weight: 700;
  font-size: 0.98rem;
  letter-spacing: 0.16em;
  color: var(--color-5);
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.header-nav__item {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--ink-secondary);
  padding: 0.44rem 0.88rem;
  border-radius: var(--radius-pill);
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.header-nav__item:hover {
  color: var(--color-5);
  background: rgba(255, 214, 224, 0.5);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.header-icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-5);
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(74, 78, 105, 0.14);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.18s ease;
}

.header-icon-btn:hover {
  background: var(--color-3);
  border-color: var(--color-3);
  transform: translateY(-1px);
}

.header-icon-btn--search {
  display: none;
}

.cart-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.48rem;
  height: 40px;
  padding: 0 0.48rem 0 0.88rem;
  border-radius: var(--radius-pill);
  background: var(--color-5);
  color: var(--color-1);
  font-size: 0.86rem;
  font-weight: 600;
  transition:
    background-color 0.2s ease,
    transform 0.18s ease,
    box-shadow 0.2s ease;
  box-shadow: 0 8px 20px -6px rgba(74, 78, 105, 0.3);
}

.cart-trigger:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px -6px rgba(195, 177, 225, 0.55);
}

.cart-trigger__subtotal {
  font-size: 0.78rem;
  color: var(--color-3);
  font-weight: 600;
}

.cart-trigger__badge {
  min-width: 26px;
  height: 26px;
  padding: 0 0.4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill);
  background: var(--color-3);
  color: var(--color-5);
  font-size: 0.78rem;
  font-weight: 700;
}

@media (max-width: 720px) {
  .header-nav {
    display: none;
  }

  .header-icon-btn--search {
    display: inline-flex;
  }
}

@media (max-width: 520px) {
  .cart-trigger__subtotal {
    display: none;
  }
}
</style>
