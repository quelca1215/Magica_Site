<script setup lang="ts">
import { useId } from 'vue'
import { storeConfig } from '@/config/store'

interface Props {
  size?: 'sm' | 'hero' | 'footer'
  animated?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 'sm',
  animated: false,
})

const uid = useId()
const gradAId = `x-grad-a-${uid}`
const gradBId = `x-grad-b-${uid}`
const glowId = `x-glow-${uid}`
</script>

<template>
  <div
    class="brand-logo"
    :class="[
      `brand-logo--${size}`,
      { 'is-animated': animated, 'brand-logo--image': Boolean(storeConfig.logoImageUrl) },
    ]"
  >
    <img
      v-if="storeConfig.logoImageUrl"
      :src="storeConfig.logoImageUrl"
      :alt="`Logo de ${storeConfig.brandName}`"
      width="500"
      height="500"
      decoding="async"
      :fetchpriority="size === 'hero' ? 'high' : undefined"
      class="brand-logo__custom"
    />
    <svg
      v-else
      class="brand-logo__svg"
      viewBox="0 0 120 120"
      fill="none"
      role="img"
      :aria-label="`Logo ${storeConfig.logoMonogram} de ${storeConfig.brandName}`"
    >
      <defs>
        <linearGradient
          :id="gradAId"
          x1="22"
          y1="22"
          x2="98"
          y2="98"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stop-color="#FFD6E0" />
          <stop offset="100%" stop-color="#FFF4E6" />
        </linearGradient>
        <linearGradient
          :id="gradBId"
          x1="98"
          y1="22"
          x2="22"
          y2="98"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stop-color="#FFD6E0" />
          <stop offset="100%" stop-color="#C3B1E1" />
        </linearGradient>
        <radialGradient :id="glowId" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFD6E0" stop-opacity="0.28" />
          <stop offset="70%" stop-color="#C3B1E1" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#FFD6E0" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Ambient soft pink halo -->
      <circle class="logo-halo" cx="60" cy="60" r="56" :fill="`url(#${glowId})`" />

      <!-- Orbital minimalist ring (prominent in hero) -->
      <circle
        class="logo-ring"
        cx="60"
        cy="60"
        r="50"
        stroke="#FFD6E0"
        stroke-opacity="0.48"
        stroke-width="1.25"
        stroke-dasharray="4 5"
      />

      <!-- Sculpted diagonal ribbon A -->
      <path
        class="logo-stroke-a"
        d="M31 31L89 89"
        :stroke="`url(#${gradAId})`"
        stroke-width="14"
        stroke-linecap="round"
      />

      <!-- Sculpted diagonal ribbon B -->
      <path
        class="logo-stroke-b"
        d="M89 31L31 89"
        :stroke="`url(#${gradBId})`"
        stroke-width="14"
        stroke-linecap="round"
      />

      <!-- Crisp highlight bevel at center intersection -->
      <circle class="logo-core" cx="60" cy="60" r="4.5" fill="#FFFFFF" fill-opacity="0.82" />

      <!-- Cream sparkle accent -->
      <path
        class="logo-glint"
        d="M95 19L97.2 24.8L103 27L97.2 29.2L95 35L92.8 29.2L87 27L92.8 24.8L95 19Z"
        fill="#FFF4E6"
      />
    </svg>
  </div>
</template>

<style scoped>
.brand-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-logo__svg,
.brand-logo__custom {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand-logo--sm {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--color-5);
  border: 1px solid var(--color-3);
  padding: 4px;
}

.brand-logo--sm .logo-ring,
.brand-logo--sm .logo-halo {
  display: none;
}

.brand-logo--hero {
  width: clamp(132px, 18vw, 176px);
  height: clamp(132px, 18vw, 176px);
  border-radius: 40px;
  background: var(--color-5);
  border: 1.5px solid var(--color-3);
  box-shadow:
    0 24px 54px -18px rgba(74, 78, 105, 0.2),
    0 12px 32px -12px rgba(255, 214, 224, 0.65);
  padding: 16px;
}

.brand-logo--footer {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: var(--color-5);
  border: 1px solid var(--color-3);
  padding: 5px;
}

.brand-logo--footer .logo-ring {
  display: none;
}

.brand-logo--image {
  border-radius: 50%;
  padding: 0;
  background: var(--color-1);
  overflow: hidden;
}

.brand-logo--image .brand-logo__custom {
  object-fit: cover;
  border-radius: 50%;
}

.brand-logo--sm.brand-logo--image {
  width: 44px;
  height: 44px;
  border: 1.5px solid var(--color-3);
  box-shadow: 0 4px 12px -4px rgba(74, 78, 105, 0.16);
}

.brand-logo--hero.brand-logo--image {
  width: clamp(185px, 24vw, 240px);
  height: clamp(185px, 24vw, 240px);
  border: 4px solid var(--color-1);
  box-shadow:
    0 24px 54px -16px rgba(74, 78, 105, 0.18),
    0 0 0 1.5px var(--color-3),
    0 12px 34px -10px rgba(255, 214, 224, 0.85);
}

.brand-logo--footer.brand-logo--image {
  width: 50px;
  height: 50px;
  border: 1.5px solid var(--color-3);
  box-shadow: 0 4px 12px -4px rgba(74, 78, 105, 0.14);
}
</style>
