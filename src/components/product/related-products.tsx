"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { BrandLoader } from "@/components/ui/brand-loader"
import { Button } from "@/components/ui/button"
import { processMultipleImageUrls } from "@/utils/image-proxy"

interface Product {
  id?: number
  "ID de artículo"?: number
  Nombre?: string
  Producto?: string
  Tipo: string
  Precio?: number | null
  Precio_de_venta?: number | null
  Estado: string
  Notas?: string
  Imagen_url?: string
}

interface RelatedProductsProps {
  currentProductId: number
  currentProductType: string
  maxProducts?: number
}

export function RelatedProducts({ currentProductId, currentProductType, maxProducts = 4 }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Función helper para obtener el ID del producto
  const getProductId = (product: Product) => {
    return product.id || product["ID de artículo"] || 0
  }

  // Función helper para obtener el nombre del producto
  const getProductName = (product: Product) => {
    return product.Nombre || product.Producto || "Producto sin nombre"
  }

  // Función helper para formatear el precio
  const getProductPrice = (product: Product) => {
    if (product.Precio_de_venta && product.Precio_de_venta > 0) {
      // Multiplicar por 1000 ya que el valor en Excel representa miles de pesos
      const priceInPesos = product.Precio_de_venta * 1000
      return `$${priceInPesos.toLocaleString('es-AR')}`
    }
    return "Consultar precio"
  }

  // Función helper para obtener la primera imagen del producto
  const getProductImage = (product: Product) => {
    const imageUrl = product.Imagen_url || ""
    
    if (!imageUrl || imageUrl.trim() === "") {
      return "/placeholder.svg?height=250&width=250"
    }
    
    // Si la URL ya es un proxy (comienza con /api/image-proxy), usarla directamente
    if (imageUrl.startsWith('/api/image-proxy')) {
      return imageUrl
    }
    
    // Si es una URL original, procesarla
    return processMultipleImageUrls(imageUrl, 'fragrance')
  }

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/sheets")
        const allProducts: Product[] = await response.json()

        // Filtrar productos relacionados:
        // 1. Mismo tipo de producto
        // 2. Excluir el producto actual
        const filtered = allProducts
          .filter(product => {
            const productId = getProductId(product)
            return productId !== currentProductId && // No incluir el producto actual
              product.Tipo === currentProductType // Mismo tipo
          })
          .slice(0, maxProducts) // Limitar cantidad

        // Si no hay suficientes productos del mismo tipo, agregar otros productos
        if (filtered.length < maxProducts) {
          const otherProducts = allProducts
            .filter(product => {
              const productId = getProductId(product)
              return productId !== currentProductId &&
                product.Tipo !== currentProductType &&
                !filtered.some(p => getProductId(p) === productId)
            })
            .slice(0, maxProducts - filtered.length)

          filtered.push(...otherProducts)
        }

        setRelatedProducts(filtered)
      } catch (error) {
        console.error("Error cargando productos relacionados:", error)
        setRelatedProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [currentProductId, currentProductType, maxProducts])

  const handleProductClick = (product: Product) => {
    const productId = getProductId(product)
    router.push(`/producto/${productId}?id=${productId}`)
  }

  if (isLoading) {
    return (
      <div className="mt-24">
        <h2 className="text-2xl font-light mb-12 text-center">También te puede interesar</h2>
        <div className="flex justify-center">
          <BrandLoader size="medium" message="Cargando productos relacionados..." />
        </div>
      </div>
    )
  }

  if (relatedProducts.length === 0) {
    return null
  }

  

  return (
    <div className="mt-24">
      <h2 className="text-2xl font-light mb-12 text-center">También te puede interesar</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {relatedProducts.map((product) => (
          <div key={getProductId(product)} className="group cursor-pointer" onClick={() => handleProductClick(product)}>
            <div className="w-full h-[250px] bg-white border border-zinc-100 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
              <Image
                src={getProductImage(product)}
                alt={getProductName(product)}
                width={250}
                height={250}
                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-normal group-hover:text-zinc-600 transition-colors">
                {getProductName(product)}
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">{product.Tipo}</span>
                <span className="font-light">{getProductPrice(product)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botón para ver todos los productos si hay más */}
      <div className="text-center mt-12">
        <Button
          variant="outline"
          onClick={() => router.push('/#products')}
          className="rounded-none border-zinc-200 text-zinc-800 hover:bg-zinc-50 px-8 py-3"
        >
          Ver Todos los Productos
        </Button>
      </div>
    </div>
  )
} 