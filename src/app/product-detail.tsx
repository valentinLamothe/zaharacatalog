"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, ChevronLeft, ChevronRight, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrandLoader } from "@/components/ui/brand-loader"
import { RelatedProducts } from "@/components/product/related-products"
import { createProxyImageUrl } from "@/utils/image-proxy"

interface Product {
  id?: number
  "ID de artículo"?: number
  Nombre?: string
  Producto?: string // Para compatibilidad
  Tipo: string
  Precio?: number | null
  Precio_de_venta?: number | null
  Estado: string
  Notas?: string
  Imagen_url?: string
  [key: string]: string | number | boolean | undefined | null
}

export default function ProductDetail() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams?.get("id")

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Función helper para procesar múltiples URLs de imágenes
  const getProductImages = (product: Product) => {
    const imageUrl = product.Imagen_url || ""
    
    if (!imageUrl || imageUrl.trim() === "") {
      return ["/placeholder.svg?height=500&width=500"]
    }
    
    // Si la URL ya es un proxy (comienza con /api/image-proxy), usarla directamente
    if (imageUrl.startsWith('/api/image-proxy')) {
      return [imageUrl]
    }
    
    // Si está en formato de array [url1, url2], remover los corchetes
    let cleanImageUrls = imageUrl
    if (imageUrl.startsWith('[') && imageUrl.endsWith(']')) {
      cleanImageUrls = imageUrl.slice(1, -1) // Remover [ y ]
    }
    
    // Dividir por comas y limpiar espacios en blanco
    const urls = cleanImageUrls.split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0) // Filtrar URLs vacías
    
    if (urls.length === 0) {
      return ["/placeholder.svg?height=500&width=500"]
    }
    
    // Procesar cada URL a través del proxy
    const processedUrls = urls.map(url => {
      return createProxyImageUrl(url, 'fragrance')
    })
    
    return processedUrls
  }

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

  useEffect(() => {
    if (productId && productId !== 'undefined') {
      setIsLoading(true)
      fetch(`/api/sheets?id=${productId}`)
        .then((res) => res.json())
        .then((data) => {
          setProduct(data)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Error cargando detalles del producto:", error)
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [productId])

  // Navegación con teclado para la galería de imágenes
  useEffect(() => {
    if (!product) return

    const productImages = getProductImages(product)
    if (productImages.length <= 1) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevImage()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        nextImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [product]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleGoBack = () => {
    router.back()
  }

  const handleDirectContact = () => {
    const productName = getProductName(product!)
    const message = `Hola, estoy interesado/a en obtener más información sobre: ${productName}`
    const whatsappUrl = `https://wa.me/+5491122773212?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  // Funciones para navegación de imágenes
  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === productImages.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? productImages.length - 1 : prev - 1
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <BrandLoader size="large" message="Cargando detalles del producto..." />
      </div>
    )
  }

  if (!product || !productId || productId === 'undefined') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <p className="text-zinc-500 mb-4">No se encontró el producto</p>
        <Button onClick={handleGoBack} variant="outline" className="rounded-none">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al catálogo
        </Button>
      </div>
    )
  }

  // Extraer información del producto
  const productName = getProductName(product)
  const productType = product.Tipo || "Sin categoría"
  const productNotes = product.Notas || ""
  const currentProductId = getProductId(product)

  // Obtener todas las imágenes del producto (múltiples URLs separadas por comas)
  const productImages = getProductImages(product)

  // Características generadas
  const productFeatures = `• Producto exclusivo\n• Diseño elegante y contemporáneo\n• Materiales de primera calidad\n• Acabado premium\n• Durabilidad garantizada\n• Contactanos para más información`

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-zinc-100 py-4 px-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Button onClick={handleGoBack} variant="ghost" className="mr-4 p-2 hover:bg-zinc-50" aria-label="Volver">
              <ArrowLeft className="h-5 w-5 text-zinc-500" />
            </Button>
            <Image src="/ZR.svg" alt="Zahara" width={60} height={60} />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Galería de imágenes del producto */}
          <div className="space-y-6">
            <div className="relative h-[500px] overflow-hidden rounded-lg">
              <Image 
                src={productImages[selectedImageIndex]} 
                alt={productName} 
                fill 
                className="object-contain" 
              />
              
              {/* Botones de navegación - solo mostrar si hay múltiples imágenes */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-all duration-200"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-all duration-200"
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              
              {/* Indicador de imagen actual si hay múltiples imágenes */}
              {productImages.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {productImages.length}
                </div>
              )}
            </div>

            {/* Miniaturas - solo mostrar si hay más de una imagen */}
            {productImages.length > 1 && (
              <div className={`grid gap-4 ${
                productImages.length === 2 ? 'grid-cols-2' :
                productImages.length === 3 ? 'grid-cols-3' :
                'grid-cols-4'
              }`}>
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-24 border-2 transition-all duration-200 rounded-lg overflow-hidden ${
                      selectedImageIndex === index 
                        ? 'border-zinc-900 shadow-lg' 
                        : 'border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Vista ${index + 1} de ${productName}`}
                      fill
                      className="object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-8">
            <div>
              <span className="text-sm text-zinc-500">{productType}</span>
              <h1 className="text-3xl font-light mt-2 mb-6">{productName}</h1>
              <div className="text-2xl font-light mb-6">{getProductPrice(product)}</div>
            </div>

            {/* Acciones principales */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleDirectContact}
                variant="outline"
                className="rounded-none border-zinc-200 text-zinc-800 hover:bg-zinc-50 py-4"
              >
                <Phone className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>

              <Button
                onClick={() => window.open('mailto:zaharashopp@gmail.com', '_blank')}
                variant="outline"
                className="rounded-none border-zinc-200 text-zinc-800 hover:bg-zinc-50 py-4"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
            </div>

            {/* Información de contacto */}
            <div className="bg-zinc-50 p-6 rounded-sm">
              <h3 className="text-lg font-light mb-4">¿Interesado en este producto?</h3>
              <p className="text-sm text-zinc-600 mb-4">
                Contáctanos para obtener más información y detalles sobre este producto.
              </p>
              <div className="flex flex-col space-y-2 text-sm text-zinc-600">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+54 9 11 2277-3212</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>zaharashopp@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Tabs con información adicional */}
            <Tabs defaultValue="descripcion" className="mt-12">
              <TabsList className="grid grid-cols-3 rounded-none bg-zinc-50">
                <TabsTrigger value="descripcion" className="rounded-none data-[state=active]:bg-white">
                  Descripción
                </TabsTrigger>
                <TabsTrigger value="caracteristicas" className="rounded-none data-[state=active]:bg-white">
                  Características
                </TabsTrigger>
                <TabsTrigger value="notas" className="rounded-none data-[state=active]:bg-white">
                  Notas
                </TabsTrigger>
              </TabsList>
              <TabsContent value="descripcion" className="pt-6">
                <p className="text-zinc-600 whitespace-pre-line">
                  {productNotes || "Para más información sobre este producto, no dudes en contactarnos. Estaremos encantados de ayudarte con todos los detalles que necesites."}
                </p>
              </TabsContent>
              <TabsContent value="caracteristicas" className="pt-6">
                <p className="text-zinc-600 whitespace-pre-line">{productFeatures}</p>
              </TabsContent>
              <TabsContent value="notas" className="pt-6">
                <p className="text-zinc-600 whitespace-pre-line">
                  {productNotes || "Para más información sobre este producto, no dudes en contactarnos. Estaremos encantados de ayudarte con todos los detalles que necesites."}
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Productos relacionados */}
        <RelatedProducts 
          currentProductId={currentProductId}
          currentProductType={productType}
          maxProducts={4}
        />
      </div>

      {/* Footer simplificado */}
      <footer className="bg-zinc-950 text-zinc-400 py-8 px-6 mt-24">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs font-light">
            © {new Date().getFullYear()} Zahara. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
