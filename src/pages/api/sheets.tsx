import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Obtener parámetros de la URL
    const { id } = req.query

    // Usar Google Sheets public CSV export (sin autenticación)
    const spreadsheetId = "1a27X7S89kCKffvT690ZAUF9gc6ceer1LGS-bvnchJh8"
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`

    const response = await fetch(csvUrl)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()
    
    // Parsear CSV
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) {
      return res.status(404).json({ error: "No se encontraron datos" })
    }

    // Extraer encabezados (primera fila) - parsear CSV correctamente
    const headers = lines[0].split(',').map((header: string) => header.replace(/"/g, '').trim())

    // Procesar los datos desde la segunda fila
    const productos = lines.slice(1).map((line: string) => {
      const values = line.split(',').map((value: string) => value.replace(/"/g, '').trim())
      const obj: Record<string, string | number | null> = {}
      
      headers.forEach((header: string, index: number) => {
        const value = values[index] || ""
        
        // Convertir valores numéricos cuando sea apropiado
        if (header === "id" || header === "ID de artículo") {
          obj[header] = value ? Number.parseInt(value, 10) : 0
        } else if (header === "Precio" || header === "Precio_de_venta") {
          // Mejor manejo de precios con valores nulos o vacíos
          if (value && value.trim() !== "") {
            const numValue = Number.parseFloat(value.replace(/[,$]/g, ''))
            obj[header] = !isNaN(numValue) ? numValue : null
          } else {
            obj[header] = null
          }
        } else {
          obj[header] = value || ""
        }
      })
      return obj
    })

    // Filtrar productos válidos (con nombre no vacío y ID válido)
    const productosValidos = productos.filter((producto: Record<string, string | number | null>) => {
      const productId = producto["id"] || producto["ID de artículo"]
      const productName = producto["Nombre"] || producto["Producto"]
      
      // Filtrar productos con ID válido (> 0) y nombre no vacío
      return productId && typeof productId === 'number' && productId > 0 && productName && productName.toString().trim() !== ""
    })

    // Si se proporciona un ID, devolver solo ese producto
    if (id) {
      // Buscar por "id" o "ID de artículo" para compatibilidad
      const producto = productosValidos.find((p: Record<string, string | number | null>) => {
        const productId = p["id"] || p["ID de artículo"]
        return productId?.toString() === id
      })
      
      if (producto) {
        return res.json(producto)
      } else {
        return res.status(404).json({ error: "Producto no encontrado" })
      }
    }

    // Si no hay ID, devolver todos los productos
    return res.json(productosValidos)
  } catch (error: unknown) {
    console.error("Error en la API de sheets:", error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return res.status(500).json({ error: errorMessage })
  }
}
