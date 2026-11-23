<script setup lang="ts">
import BrandLogo from '@/components/BrandLogo.vue'
import { storeConfig } from '@/config/store'
</script>

<template>
  <footer class="app-footer">
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
