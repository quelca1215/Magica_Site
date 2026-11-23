<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import BrandLogo from '@/components/BrandLogo.vue'
import { canAnimateSvg, gsap, prefersReducedMotion } from '@/composables/useGsap'
import { storeConfig } from '@/config/store'

interface Props {
  totalProducts: number
  totalCategories: number
}

defineProps<Props>()

const heroRef = ref<HTMLElement | null>(null)
let ctx: gsap.Context | undefined

onMounted(() => {
  if (!heroRef.value || prefersReducedMotion()) return

  ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.from('.hero-logo-stage', {
      scale: 0.82,
      opacity: 0,
      duration: 0.75,
      ease: 'expo.out',
    }).from(
      '.hero-logo-orbit',
      {
        scale: 0.86,
        opacity: 0,
        rotation: -12,
        duration: 0.85,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      },
      '-=0.55',
    )

    if (canAnimateSvg() && heroRef.value?.querySelector('.logo-stroke-a')) {
      tl.from(
        '.logo-stroke-a',
        {
          scale: 0.75,
          opacity: 0,
          transformOrigin: 'center center',
          duration: 0.55,
        },
        '-=0.45',
      )
        .from(
          '.logo-stroke-b',
          {
            scale: 0.75,
            opacity: 0,
            transformOrigin: 'center center',
            duration: 0.55,
          },
          '-=0.42',
        )
        .from(
          '.logo-glint',
          {
            scale: 0,
            rotation: -45,
            transformOrigin: 'center center',
            duration: 0.45,
            ease: 'back.out(2.2)',
          },
          '-=0.25',
        )
    }

    tl.from(
      '.hero-stagger',
      {
        y: 20,
        opacity: 0,
        duration: 0.55,
        stagger: 0.08,
        clearProps: 'transform,opacity',
      },
      '-=0.45',
    )

    gsap.to('.hero-logo-float', {
      y: -7,
      duration: 2.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  }, heroRef.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <section id="top" ref="heroRef" class="hero">
    <div class="hero__glow hero__glow--pink" aria-hidden="true"></div>
    <div class="hero__glow hero__glow--lavender" aria-hidden="true"></div>

    <div class="container hero__inner">
      <!-- Protagonist Logo -->
      <div class="hero-logo-stage">
        <div class="hero-logo-wrap">
          <div class="hero-logo-orbit" aria-hidden="true"></div>
          <div class="hero-logo-float">
            <BrandLogo size="hero" animated />
          </div>
        </div>
        <span v-if="!storeConfig.logoImageUrl" class="hero-logo-caption"
          >{{ storeConfig.brandName }} · SIGNATURE {{ storeConfig.logoMonogram }}</span
        >
      </div>

      <!-- Minimalist Editorial Headline -->
      <div class="hero__content">
        <h1 class="hero__title hero-stagger">
          Productos <span class="hero__title-accent">con </span> zzzzz
        </h1>

        <p class="hero__subtitle hero-stagger">
          Explora nuestros productos por tipo, filtra en tiempo real y arma tu carrito para
          solicitar un solo artículo o todo tu pedido por WhatsApp.
        </p>

        <div class="hero__actions hero-stagger">
          <a href="#catalogo" class="hero__cta">
            <span>Explorar catálogo</span>
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
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
          </a>

          <div class="hero__stats">
            <span class="stat-pill">
              <strong class="tabular-nums">{{ totalProducts }}</strong> productos
            </span>
            <span class="stat-pill">
              <strong class="tabular-nums">{{ totalCategories }}</strong> categorías
            </span>
            <span class="stat-pill stat-pill--accent">WhatsApp 1-clic</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  padding: calc(var(--header-height) + clamp(2rem, 5vw, 3.5rem)) 0 clamp(2.25rem, 5vw, 3.75rem);
  border-bottom: 1px solid var(--border-subtle);
  background: linear-gradient(180deg, var(--color-1) 0%, var(--color-2) 100%);
}

.hero__glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(72px);
}

.hero__glow--pink {
  width: 420px;
  height: 420px;
  top: -130px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 214, 224, 0.65);
}

.hero__glow--lavender {
  width: 300px;
  height: 300px;
  bottom: -110px;
  right: 12%;
  background: rgba(195, 177, 225, 0.42);
}

.hero__inner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2rem;
}

.hero-logo-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
}

.hero-logo-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.hero-logo-orbit {
  position: absolute;
  width: clamp(208px, 27vw, 266px);
  height: clamp(208px, 27vw, 266px);
  border-radius: 50%;
  border: 1.5px dashed var(--color-4);
  pointer-events: none;
}

.hero-logo-float {
  position: relative;
  z-index: 1;
}

.hero-logo-caption {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--color-5);
}

.hero__content {
  max-width: 680px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.1rem;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.38rem 0.9rem;
  border-radius: var(--radius-pill);
  background: var(--color-1);
  border: 1px solid var(--color-4);
  color: var(--color-5);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.hero-eyebrow__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-3);
  border: 1px solid var(--color-4);
  box-shadow: 0 0 0 3px rgba(255, 214, 224, 0.45);
}

.hero__title {
  font-size: clamp(2.1rem, 4.6vw, 3.35rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.025em;
  color: var(--ink-primary);
}

.hero__title-accent {
  font-family: var(--font-editorial);
  font-style: italic;
  font-weight: 600;
  color: var(--color-5);
  background: linear-gradient(180deg, transparent 54%, var(--color-3) 54%);
  padding: 0 0.15em;
  border-radius: 4px;
}

.hero__subtitle {
  max-width: 560px;
  font-size: clamp(0.95rem, 1.5vw, 1.06rem);
  color: var(--ink-secondary);
}

.hero__actions {
  margin-top: 0.4rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.hero__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.8rem 1.45rem;
  border-radius: var(--radius-pill);
  background: var(--color-5);
  color: var(--color-1);
  font-size: 0.92rem;
  font-weight: 600;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
  box-shadow: 0 12px 26px -10px rgba(74, 78, 105, 0.38);
}

.hero__cta:hover {
  background: var(--color-3);
  color: var(--color-5);
  transform: translateY(-2px);
  box-shadow: 0 14px 28px -10px rgba(195, 177, 225, 0.55);
}

.hero__stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.stat-pill {
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-pill);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  font-size: 0.82rem;
  color: var(--ink-secondary);
}

.stat-pill strong {
  color: var(--ink-primary);
}

.stat-pill--accent {
  background: var(--color-3);
  border-color: transparent;
  color: var(--color-5);
  font-weight: 600;
}
</style>
