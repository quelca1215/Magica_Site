<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import BrandLogo from '@/components/BrandLogo.vue'
import { gsap, prefersReducedMotion } from '@/composables/useGsap'
import { useIntro } from '@/composables/useIntro'
import { storeConfig } from '@/config/store'

const footerRef = ref<HTMLElement | null>(null)
const { isIntroRevealed } = useIntro()
let ctx: gsap.Context | undefined

watch(isIntroRevealed, async (revealed) => {
  if (!revealed || !footerRef.value || prefersReducedMotion()) return

  await nextTick()

  if (!ctx) {
    ctx = gsap.context(() => {}, footerRef.value)
  }

  ctx.add(() => {
    gsap.fromTo(
      footerRef.value,
      { autoAlpha: 0, y: 18 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        delay: 0.45,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
    )
  })
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <footer ref="footerRef" class="app-footer" :class="{ 'is-intro-hidden': !isIntroRevealed }">
    <div class="container app-footer__inner">
      <div class="app-footer__brand">
        <BrandLogo size="footer" />
        <div>
          <strong class="app-footer__name">{{ storeConfig.brandName }}</strong>
          <p class="app-footer__tagline">{{ storeConfig.tagline }}</p>
        </div>
      </div>

      <p class="app-footer__note">
        Pedidos atendidos directamente vía WhatsApp · {{ new Date().getFullYear() }}
      </p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: auto;
  padding: 2.25rem 0;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}

.app-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.app-footer__brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.app-footer__name {
  display: block;
  font-size: 0.92rem;
  letter-spacing: 0.14em;
  color: var(--ink-primary);
}

.app-footer__tagline {
  font-size: 0.84rem;
  color: var(--ink-secondary);
}

.app-footer__note {
  font-size: 0.82rem;
  color: var(--ink-muted);
}
</style>
