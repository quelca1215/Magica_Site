import magicaLogo from '@/assets/images/magica_logo.png'

/**
 * Configuración centralizada de la tienda.
 * Modifica estos valores para personalizar tu marca, número de WhatsApp y moneda.
 */
export const storeConfig = {
  brandName: 'MÁGICA',
  logoMonogram: 'X',
  /**
   * Ruta o importación del archivo de logo de la marca.
   * Si queda vacío (''), se mostrará el monograma X SVG por defecto.
   */
  logoImageUrl: magicaLogo,
  tagline: 'Diseño minimalista, detalles con esencia.',
  /**
   * Número de celular de WhatsApp con código de país (sin '+' ni espacios).
   * Ejemplo: '573001234567' (Colombia), '5215512345678' (México), '34600123456' (España).
   */
  whatsappPhone: '71289102',
  currency: 'USD',
  locale: 'es-US',
} as const
