import { ref } from 'vue'
import { prefersReducedMotion } from '@/composables/useGsap'

const isIntroRevealed = ref(prefersReducedMotion())

function startIntro() {
  isIntroRevealed.value = prefersReducedMotion()
  if (!isIntroRevealed.value && typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
  }
}

function completeIntro() {
  isIntroRevealed.value = true
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
}

export function useIntro() {
  return {
    isIntroRevealed,
    startIntro,
    completeIntro,
  }
}
