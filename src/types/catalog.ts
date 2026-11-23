export type ProductCategoryId = 'velas' | 'accesorios' | 'skincare' | 'hogar'

export interface CategoryDefinition {
  id: ProductCategoryId
  label: string
  description: string
}

export interface Product {
  id: string
  title: string
  type: ProductCategoryId
  shortDescription: string
  fullDescription: string
  price: number
  image: string
  badge?: string
  featured?: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc'
