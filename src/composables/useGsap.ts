import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let pluginRegistered = false

export function ensureGsapRegistered() {
  if (!pluginRegistered) {
    gsap.registerPlugin(ScrollTrigger)
    pluginRegistered = true
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function canAnimateSvg(): boolean {
  if (typeof document === 'undefined') return false
  try {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const baseVal = (path as unknown as { transform?: { baseVal?: { consolidate?: unknown } } })
      .transform?.baseVal
    return typeof baseVal?.consolidate === 'function'
  } catch {
    return false
  }
}

export { gsap, ScrollTrigger }
