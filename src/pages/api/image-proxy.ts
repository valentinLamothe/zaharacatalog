import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url, type = 'fragrance' } = req.query

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' })
  }

  try {
    // Decodificar la URL base64
    const decodedUrl = Buffer.from(url, 'base64').toString('utf-8')
    
    // Validar que la URL sea de dominio permitido (seguridad)
    const allowedDomains = [
      'i.imgur.com',
      'imgur.com',
      'drive.google.com',
      'lh3.googleusercontent.com'
    ]
    
    const urlDomain = new URL(decodedUrl).hostname
    if (!allowedDomains.some(domain => urlDomain.includes(domain))) {
      return res.status(403).json({ error: 'Domain not allowed' })
    }

    // Hacer la petición a la imagen original
    const imageResponse = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ZaharaBot/1.0)',
        'Accept': 'image/*,*/*;q=0.8',
        'Cache-Control': 'no-cache'
      }
    })

    if (!imageResponse.ok) {
      return res.status(404).json({ error: 'Image not found' })
    }

    // Obtener el tipo de contenido
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
    
    // Configurar headers de respuesta
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400') // Cache por 24 horas
    res.setHeader('Access-Control-Allow-Origin', '*')
    
    // Opcional: agregar watermark o header personalizado para identificar la fuente
    res.setHeader('X-Image-Source', type === 'decant' ? 'Zahara-Decants' : 'Zahara-Fragrances')

    // Transmitir la imagen
    const buffer = await imageResponse.arrayBuffer()
    res.send(Buffer.from(buffer))

  } catch (error) {
    console.error('Error proxying image:', error)
    res.status(500).json({ error: 'Failed to proxy image' })
  }
} 