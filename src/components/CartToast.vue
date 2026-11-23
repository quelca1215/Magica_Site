<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import { gsap, prefersReducedMotion } from '@/composables/useGsap'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()
const toastRef = ref<HTMLElement | null>(null)
let ctx: gsap.Context | undefined

watch(
  () => cart.toastMessage,
  async (message) => {
    if (!message || prefersReducedMotion()) return
    await nextTick()
    if (!toastRef.value) return
    ctx?.revert()
    ctx = gsap.context(() => {
      gsap.fromTo(
        toastRef.value,
        { opacity: 0, y: 18, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.28,
          ease: 'back.out(1.6)',
          clearProps: 'transform,opacity',
        },
      )
    })
  },
)

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="cart.toastMessage"
      ref="toastRef"
      class="cart-toast"
      role="status"
      aria-live="polite"
    >
      <span class="cart-toast__dot" aria-hidden="true"></span>
      <span class="cart-toast__text">{{ cart.toastMessage }}</span>
      <button type="button" class="cart-toast__action" @click="cart.openCart()">Ver carrito</button>
      <button
        type="button"
        class="cart-toast__close"
        aria-label="Cerrar notificación"
        @click="cart.dismissToast()"
      >
        ×
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.cart-toast {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 55;
  max-width: calc(100vw - 2rem);
  padding: 0.68rem 0.85rem 0.68rem 1rem;
  border-radius: var(--radius-pill);
  background: var(--color-5);
  color: var(--color-1);
  box-shadow: 0 16px 36px -8px rgba(74, 78, 105, 0.35);
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.85rem;
}

.cart-toast__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-3);
  flex-shrink: 0;
}

.cart-toast__text {
  font-weight: 500;
}

.cart-toast__action {
  padding: 0.28rem 0.7rem;
  border-radius: var(--radius-pill);
  background: var(--color-3);
  color: var(--color-5);
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.cart-toast__action:hover {
  background: var(--color-4);
  color: var(--color-5);
}

.cart-toast__close {
  font-size: 1.15rem;
  line-height: 1;
  color: rgba(255, 255, 255, 0.72);
  padding: 0 0.2rem;
}

.cart-toast__close:hover {
  color: var(--color-1);
}
</style>
