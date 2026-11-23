<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import BrandLogo from '@/components/BrandLogo.vue'
import { canAnimateSvg, gsap, prefersReducedMotion } from '@/composables/useGsap'
import { useIntro } from '@/composables/useIntro'
import { storeConfig } from '@/config/store'

interface Props {
  totalProducts: number
  totalCategories: number
}

defineProps<Props>()

const heroRef = ref<HTMLElement | null>(null)
const logoStageRef = ref<HTMLElement | null>(null)
const { isIntroRevealed, startIntro, completeIntro } = useIntro()
let ctx: gsap.Context | undefined

onMounted(() => {
  if (!heroRef.value || prefersReducedMotion()) {
    completeIntro()
    return
  }

  startIntro()

  const loaderScale = typeof window !== 'undefined' && window.innerWidth < 640 ? 1.18 : 1.38

  async function revealPage() {
    const stageEl = logoStageRef.value
    const firstRect = stageEl?.getBoundingClientRect()

    completeIntro()
    await nextTick()

    const lastRect = stageEl?.getBoundingClientRect()
    const deltaY =
      firstRect && lastRect && firstRect.height > 0 && lastRect.height > 0
        ? firstRect.top + firstRect.height / 2 - (lastRect.top + lastRect.height / 2)
        : 0

    ctx?.add(() => {
      if (stageEl) {
        gsap.fromTo(
          stageEl,
          { y: deltaY, scale: loaderScale },
          {
            y: 0,
            scale: 1,
            duration: 0.95,
            ease: 'power3.inOut',
            clearProps: 'transform',
          },
        )
      }

      gsap.fromTo(
        '.hero-stagger',
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          delay: 0.35,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'transform,opacity,visibility',
        },
      )
    })
  }

  ctx = gsap.context(() => {
    gsap.to('.hero-logo-float', {
      y: -10,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })

    const tl = gsap.timeline()

    tl.fromTo(
      '.hero-logo-stage',
      { scale: 0.65, autoAlpha: 0 },
      { scale: loaderScale, autoAlpha: 1, duration: 0.85, ease: 'expo.out' },
      0,
    ).from(
      '.hero-logo-orbit',
      {
        scale: 0.82,
        opacity: 0,
        rotation: -18,
        duration: 0.9,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      },
      0.15,
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
        0.3,
      )
        .from(
          '.logo-stroke-b',
          {
            scale: 0.75,
            opacity: 0,
            transformOrigin: 'center center',
            duration: 0.55,
          },
          0.35,
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
          0.55,
        )
    }

    tl.fromTo(
      '.hero-logo-spin',
      { rotationY: 0 },
      {
        rotationY: -360,
        duration: 2.65,
        ease: 'power2.inOut',
        transformOrigin: 'center center',
        clearProps: 'transform',
      },
      0.35,
    ).call(() => {
      void revealPage()
    }, undefined, 3)
  }, heroRef.value)
})

onUnmounted(() => {
  ctx?.revert()
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <section id="top" ref="heroRef" class="hero" :class="{ 'hero--loader': !isIntroRevealed }">
    <div class="hero__glow hero__glow--pink" aria-hidden="true"></div>
    <div class="hero__glow hero__glow--lavender" aria-hidden="true"></div>

    <div class="container hero__inner">
      <!-- Protagonist Logo -->
      <div ref="logoStageRef" class="hero-logo-stage">
        <div class="hero-logo-wrap">
          <div class="hero-logo-orbit" aria-hidden="true"></div>
          <div class="hero-logo-float">
            <div class="hero-logo-spin">
              <BrandLogo size="hero" animated />
            </div>
          </div>
        </div>
        <span v-if="!storeConfig.logoImageUrl" class="hero-logo-caption"
          >{{ storeConfig.brandName }} · SIGNATURE {{ storeConfig.logoMonogram }}</span
        >
      </div>

      <!-- Minimalist Editorial Headline -->
      <div class="hero__content" :class="{ 'is-intro-hidden': !isIntroRevealed }">
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

.hero--loader {
  min-height: 100dvh;
  padding: 0;
  border-bottom-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero--loader .hero__inner {
  gap: 0;
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
  perspective: 1000px;
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

.hero-logo-spin {
  transform-style: preserve-3d;
  will-change: transform;
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
