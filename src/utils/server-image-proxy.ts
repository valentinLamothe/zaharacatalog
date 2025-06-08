/**
 * Funciones utilitarias para convertir URLs de imagen a URLs de proxy en el lado del servidor
 * Esto asegura que las APIs nunca expongan URLs originales
 */

/**
 * Convierte una URL de imagen original a una URL de proxy
 * @param originalUrl - URL original de la imagen
 * @param type - Tipo de producto ('fragrance' | 'decant')
 * @returns URL de proxy codificada o placeholder si es inválida
 */
export function createServerProxyImageUrl(originalUrl: string, type: 'fragrance' | 'decant' = 'fragrance'): string {
  if (!originalUrl || originalUrl.trim() === '') {
    return '/placeholder.svg?height=320&width=320'
  }

  // Validar que la URL sea mínimamente válida
  if (originalUrl.length < 10 || !originalUrl.includes('http')) {
    return '/placeholder.svg?height=320&width=320'
  }

  // Para URLs de álbum de Imgur, usar placeholder hasta conversión manual
  if (originalUrl.includes('imgur.com/a/')) {
    return '/placeholder.svg?height=320&width=320'
  }

  try {
    // Codificar la URL original en base64 para ocultarla
    const encodedUrl = Buffer.from(originalUrl).toString('base64')
    
    // Crear la URL del proxy
    return `/api/image-proxy?url=${encodedUrl}&type=${type}`
  } catch (error) {
    console.error('Error creating server proxy URL:', error)
    return '/placeholder.svg?height=320&width=320'
  }
}

/**
 * Procesa URLs de imagen múltiples (separadas por comas) y devuelve la primera URL válida como proxy
 * @param imageUrls - String con URLs separadas por comas
 * @param type - Tipo de producto ('fragrance' | 'decant')  
 * @returns URL de proxy de la primera imagen válida
 */
export function processServerMultipleImageUrls(imageUrls: string, type: 'fragrance' | 'decant' = 'fragrance'): string {
  if (!imageUrls || imageUrls.trim() === '') {
    return '/placeholder.svg?height=320&width=320'
  }

  // Si está en formato de array [url1, url2], remover los corchetes
  let cleanImageUrls = imageUrls
  if (imageUrls.startsWith('[') && imageUrls.endsWith(']')) {
    cleanImageUrls = imageUrls.slice(1, -1) // Remover [ y ]
  }

  // Si hay múltiples URLs separadas por comas, usar solo la primera válida
  const urls = cleanImageUrls.split(',')
    .map(url => url.trim())
    .filter(url => url.length > 0) // Filtrar URLs vacías

  if (urls.length === 0) {
    return '/placeholder.svg?height=320&width=320'
  }

  const firstUrl = urls[0]
  
  // Para URLs de Google Drive, convertir a formato de vista directa
  if (firstUrl.includes('drive.google.com/file/d/')) {
    const fileIdMatch = firstUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (fileIdMatch) {
      const fileId = fileIdMatch[1]
      const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`
      return createServerProxyImageUrl(directUrl, type)
    }
  }

  return createServerProxyImageUrl(firstUrl, type)
}

/**
 * Procesa un objeto de producto/decant para convertir URLs de imagen a URLs de proxy
 * @param item - Objeto que contiene Imagen_url
 * @param type - Tipo de producto ('fragrance' | 'decant')
 * @returns Objeto con Imagen_url convertida a proxy
 */
export function processItemImageUrls(item: Record<string, string | number | null>, type: 'fragrance' | 'decant'): Record<string, string | number | null> {
  const processedItem = { ...item }
  
  if ('Imagen_url' in processedItem && processedItem.Imagen_url && typeof processedItem.Imagen_url === 'string') {
    processedItem.Imagen_url = processServerMultipleImageUrls(processedItem.Imagen_url, type)
  }
  
  return processedItem
} 