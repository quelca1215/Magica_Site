import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { PRODUCTS } from '@/data/products'
import { useCartStore } from '@/stores/cart'
import CatalogView from '@/views/CatalogView.vue'

describe('CatalogView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('renders all catalog products initially', () => {
    const wrapper = mount(CatalogView, {
      global: {
        plugins: [createPinia()],
      },
    })

    const cards = wrapper.findAll('[data-testid="product-card"]')
    expect(cards.length).toBe(PRODUCTS.length)
    wrapper.unmount()
  })

  it('filters products by accent-insensitive search query and category type', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const wrapper = mount(CatalogView, {
      global: {
        plugins: [pinia],
      },
    })

    const searchInput = wrapper.find('#catalog-search-input')
    await searchInput.setValue('serum')

    let cards = wrapper.findAll('[data-testid="product-card"]')
    expect(cards.length).toBe(2) // Sérum Luminoso + Set Regalo Esencia X (mentions sérum)

    await searchInput.setValue('')
    const categoryButtons = wrapper.findAll('.category-pill')
    const accesoriosBtn = categoryButtons.find((btn) => btn.text().includes('Accesorios'))
    expect(accesoriosBtn).toBeTruthy()
    await accesoriosBtn!.trigger('click')

    cards = wrapper.findAll('[data-testid="product-card"]')
    expect(cards.length).toBe(2)

    wrapper.unmount()
  })

  it('adds a product to the Pinia cart when clicking Agregar', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const cart = useCartStore()

    const wrapper = mount(CatalogView, {
      global: {
        plugins: [pinia],
      },
    })

    const addButton = wrapper.find('.btn-add')
    expect(addButton.exists()).toBe(true)
    await addButton.trigger('click')

    expect(cart.totalItems).toBe(1)
    expect(wrapper.find('.qty-stepper').exists()).toBe(true)

    wrapper.unmount()
  })
})
