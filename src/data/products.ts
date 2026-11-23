import type { CategoryDefinition, Product } from '@/types/catalog'

export const PRODUCT_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'velas',
    label: 'Velas & Aroma',
    description: 'Cera vegetal y esencias botánicas para ambientar tus espacios.',
  },
  {
    id: 'accesorios',
    label: 'Accesorios',
    description: 'Joyería sutil con acabados dorados y piedras naturales.',
  },
  {
    id: 'skincare',
    label: 'Skincare',
    description: 'Fórmulas botánicas ligeras para el cuidado diario.',
  },
  {
    id: 'hogar',
    label: 'Hogar & Regalos',
    description: 'Piezas de cerámica artesanal y sets listos para obsequiar.',
  },
]

export const CATEGORY_MAP: Record<CategoryDefinition['id'], CategoryDefinition> = {
  velas: PRODUCT_CATEGORIES[0]!,
  accesorios: PRODUCT_CATEGORIES[1]!,
  skincare: PRODUCT_CATEGORIES[2]!,
  hogar: PRODUCT_CATEGORIES[3]!,
}

export const PRODUCTS: Product[] = [
  {
    id: 'vela-peonia-rosa',
    title: 'Vela Escultural Peonía',
    type: 'velas',
    shortDescription: 'Cera de soya acanalada con notas de peonía rosa, cedro blanco y vainilla.',
    fullDescription:
      'Elaborada artesanalmente con cera de soya 100% vegetal de quemado lento. Su silueta orgánica acanalada en tono marfil y rubor aporta calma visual antes incluso de encenderla.',
    price: 24,
    image: '/images/products/vela-peonia.jpg',
    badge: 'Favorito',
    featured: true,
  },
  {
    id: 'difusor-ambar-rose',
    title: 'Difusor Ámbar & Rosa',
    type: 'velas',
    shortDescription: 'Varillas de ratán con esencia floral amaderada de larga duración.',
    fullDescription:
      'Frasco de vidrio esmerilado en tonos ámbar y rosa empolvado con 120 ml de fragancia concentrada sin alcohol. Perfuma suavemente habitaciones y estudios por hasta 10 semanas.',
    price: 32,
    image: '/images/products/difusor-ambar.jpg',
    featured: true,
  },
  {
    id: 'collar-perla-aurora',
    title: 'Collar Perla Aurora',
    type: 'accesorios',
    shortDescription: 'Cadena fina bañada en oro de 18k con perla barroca natural.',
    fullDescription:
      'Diseño minimalista de uso diario. Cadena delicada de 42 cm con extensión ajustable y perla orgánica seleccionada por su brillo nacarado cálido.',
    price: 38,
    image: '/images/products/collar-perla.jpg',
    badge: 'Favorito',
    featured: true,
  },
  {
    id: 'aretes-cuarzo-rosa',
    title: 'Aretes Cuarcita Rosada',
    type: 'accesorios',
    shortDescription: 'Argollas en oro cepillado con gotas pulidas de cuarzo rosa.',
    fullDescription:
      'Ligeros e hipoalergénicos, pensados para acompañar desde looks casuales hasta eventos de noche con un destello translúcido en rosa suave.',
    price: 29,
    image: '/images/products/aretes-cuarcita.jpg',
    badge: 'Nuevo',
    featured: false,
  },
  {
    id: 'serum-rosa-mosqueta',
    title: 'Sérum Luminoso Rosa Mosqueta',
    type: 'skincare',
    shortDescription: 'Aceite facial ligero rico en antioxidantes y vitamina E natural.',
    fullDescription:
      'Fórmula de rápida absorción prensada en frío que hidrata sin sensación grasa, devolviendo elasticidad y luminosidad uniforme a todo tipo de piel.',
    price: 34,
    image: '/images/products/serum-rosa.jpg',
    badge: 'Nuevo',
    featured: true,
  },
  {
    id: 'balsamo-nectar-petal',
    title: 'Bálsamo Labial Néctar',
    type: 'skincare',
    shortDescription: 'Hidratación profunda con manteca de karité y brillo rosa translúcido.',
    fullDescription:
      'Enriquecido con escualano vegetal y ceras botánicas. Suaviza al instante dejando un velo rosado natural con acabado satinado.',
    price: 16,
    image: '/images/products/balsamo-nectar.jpg',
    featured: false,
  },
  {
    id: 'taza-ceramica-bruma',
    title: 'Taza Cerámica Bruma',
    type: 'hogar',
    shortDescription: 'Taza artesanal esmaltada a mano en degradado crema y rosa polvo.',
    fullDescription:
      'Pieza torneada en gres moteado con capacidad de 280 ml. Apta para bebidas calientes, microondas y lavavajillas manteniendo su textura suave al tacto.',
    price: 22,
    image: '/images/products/taza-ceramica.jpg',
    featured: false,
  },
  {
    id: 'set-regalo-esencia',
    title: 'Set Regalo Esencia X',
    type: 'hogar',
    shortDescription: 'Caja curada con vela escultural, sérum botánico y cinta de seda.',
    fullDescription:
      'Nuestra presentación insignia lista para regalar. Incluye empaque rígido minimalista con lazo de seda rosa y tarjeta dedicatoria personalizable.',
    price: 54,
    image: '/images/products/set-esencia.jpg',
    badge: 'Edición Limitada',
    featured: true,
  },
]
