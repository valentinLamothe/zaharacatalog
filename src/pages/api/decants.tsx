import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Obtener parámetros de la URL
    const { id } = req.query

    // Usar Google Sheets public CSV export para la hoja de decants (sin autenticación)
    const spreadsheetId = "1a27X7S89kCKffvT690ZAUF9gc6ceer1LGS-bvnchJh8"
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=150551897`

    const response = await fetch(csvUrl)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()
    
    // Parsear CSV
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) {
      return res.status(404).json({ error: "No se encontraron datos de decants" })
    }

    // Extraer encabezados (primera fila) - parsear CSV correctamente
    const headers = lines[0].split(',').map((header: string) => header.replace(/"/g, '').trim())

    // Procesar los datos desde la segunda fila
    const decants = lines.slice(1).map((line: string) => {
      const values = line.split(',').map((value: string) => value.replace(/"/g, '').trim())
      const obj: Record<string, string | number | null> = {}
      
      headers.forEach((header: string, index: number) => {
        const value = values[index] || ""
        
        // Convertir valores numéricos cuando sea apropiado
        if (header === "id" || header === "ID de artículo") {
          obj[header] = value ? Number.parseInt(value, 10) : 0
        } else if (header === "Precio 5 ML" || header === "Precio 10 Ml") {
          // Manejo de precios que vienen como números desde el spreadsheet
          if (value !== undefined && value !== null && value !== "") {
            obj[header] = Number.parseFloat(value.toString())
          } else {
            obj[header] = null
          }
        } else {
          obj[header] = value || ""
        }
      })
      return obj
    })

    // Filtrar solo decants que tengan ID válido y nombre
    const validDecants = decants.filter((decant: Record<string, string | number | null>) => {
      const decantId = decant["id"]
      const decantName = decant["Nombre"]
      return decantId && 
             typeof decantId === 'number' && 
             decantId > 0 && 
             decantName && 
             decantName.toString().trim() !== ""
    })

    // Si se proporciona un ID, devolver solo ese decant
    if (id) {
      const decant = validDecants.find((d: Record<string, string | number | null>) => {
        const decantId = d["id"]
        return decantId?.toString() === id
      })
      
      if (decant) {
        return res.json(decant)
      } else {
        return res.status(404).json({ error: "Decant no encontrado" })
      }
    }

    // Si no hay ID, devolver todos los decants
    return res.json(validDecants)
  } catch (error: unknown) {
    console.error("Error en la API de decants:", error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return res.status(500).json({ error: errorMessage })
  }
} 