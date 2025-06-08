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

    // Usar la hoja específica de decants (gid=150551897)
    // Primero obtenemos información del spreadsheet para encontrar el nombre de la hoja
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId,
    })

    // Buscar la hoja con gid=150551897
    const sheetsInfo = spreadsheetInfo.data.sheets || []
    const targetSheet = sheetsInfo.find(sheet => 
      sheet.properties?.sheetId === 150551897
    )

    if (!targetSheet) {
      return res.status(404).json({ error: "Hoja de decants no encontrada" })
    }

    const sheetName = targetSheet.properties?.title || "Sheet2"
    const range = `${sheetName}!A1:G100` // Columnas A-G según el spreadsheet

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
      valueRenderOption: 'UNFORMATTED_VALUE' // Para obtener valores sin formato
    })

    const rows = response.data.values
    if (!rows || rows.length < 2) {
      return res.status(404).json({ error: "No se encontraron datos de decants" })
    }

    // Extraer encabezados (primera fila)
    const headers = rows[0]

    // Procesar los datos desde la segunda fila
    const decants = rows.slice(1).map((row) => {
      const obj: Record<string, string | number | null> = {}
      headers.forEach((header, index) => {
        // Convertir valores numéricos cuando sea apropiado
        if (header === "id" || header === "ID de artículo") {
          obj[header] = row[index] ? Number.parseInt(row[index], 10) : 0
        } else if (header === "Precio 5 ML" || header === "Precio 10 Ml") {
          // Manejo de precios que vienen como números desde el spreadsheet
          const value = row[index]
          if (value !== undefined && value !== null && value !== "") {
            obj[header] = Number.parseFloat(value.toString())
          } else {
            obj[header] = null
          }
        } else {
          obj[header] = row[index] || ""
        }
      })
      return obj
    })

    // Filtrar solo decants que tengan ID válido y nombre
    const validDecants = decants.filter(decant => {
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
      const decant = validDecants.find((d) => {
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