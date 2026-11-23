<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import CartDrawer from '@/components/CartDrawer.vue'
import CartToast from '@/components/CartToast.vue'
</script>

<template>
  <AppHeader />
  <main class="app-main">
    <RouterView />
  </main>
  <AppFooter />
  <CartDrawer />
  <CartToast />
</template>

<style scoped>
.app-main {
  flex: 1;
}
</style>
