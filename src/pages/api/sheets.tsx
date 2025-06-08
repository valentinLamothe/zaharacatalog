import { google } from "googleapis"
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Obtener parámetros de la URL
    const { id } = req.query

    // Cargar credenciales desde variables de entorno
    const credentials = {
      type: "service_account",
      project_id: process.env.GOOGLE_SHEETS_PROJECT_ID,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    }

    // Verificar que las credenciales estén configuradas
    if (!credentials.project_id || !credentials.private_key || !credentials.client_email) {
      return res.status(500).json({ error: "Google Sheets credentials not configured" })
    }

    // Autenticación
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || "1a27X7S89kCKffvT690ZAUF9gc6ceer1LGS-bvnchJh8"
    const range = "A1:L100" // Ampliado para incluir más columnas e Imagen_url

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    })

    

    const rows = response.data.values
    if (!rows || rows.length < 2) {
      return res.status(404).json({ error: "No se encontraron datos" })
    }

    // Extraer encabezados (primera fila)
    const headers = rows[0]

    // Procesar los datos desde la segunda fila
    const productos = rows.slice(1).map((row) => {
      const obj: Record<string, string | number | null> = {}
      headers.forEach((header, index) => {
        // Convertir valores numéricos cuando sea apropiado
        if (header === "id" || header === "ID de artículo") {
          obj[header] = row[index] ? Number.parseInt(row[index], 10) : 0
        } else if (header === "Precio" || header === "Precio_de_venta") {
          // Mejor manejo de precios con valores nulos o vacíos
          const value = row[index]
          if (value && value.trim() !== "") {
            const numValue = Number.parseFloat(value.replace(/[,$]/g, ''))
            obj[header] = !isNaN(numValue) ? numValue : null
          } else {
            obj[header] = null
          }
        } else {
          obj[header] = row[index] || ""
        }
      })
      return obj
    })

    // Filtrar productos válidos (con nombre no vacío y ID válido)
    const productosValidos = productos.filter(producto => {
      const productId = producto["id"] || producto["ID de artículo"]
      const productName = producto["Nombre"] || producto["Producto"]
      
      // Filtrar productos con ID válido (> 0) y nombre no vacío
      return productId && typeof productId === 'number' && productId > 0 && productName && productName.toString().trim() !== ""
    })

    // Si se proporciona un ID, devolver solo ese producto
    if (id) {
      // Buscar por "id" o "ID de artículo" para compatibilidad
      const producto = productosValidos.find((p) => {
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
