"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Phone, Mail, Droplets, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { RelatedProducts } from "@/components/product/related-products"
import { createProxyImageUrl } from "@/utils/image-proxy"

interface Decant {
  id: number
  Nombre?: string
  Tipo?: string
  "Precio 5 ML"?: number
  "Precio 10 Ml"?: number
  Imagen_url?: string
  [key: string]: string | number | boolean | undefined | null
}

export default function DecantDetail() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const decantId = searchParams?.get("id")

  const [decant, setDecant] = useState<Decant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<'5ml' | '10ml'>('5ml')

  // Funciones helper para obtener datos de decants de manera segura
  const getDecantName = (decant: Decant) => {
    return decant.Nombre || "Producto sin nombre"
  }

  const getDecantType = (decant: Decant) => {
    return decant.Tipo || "Decant"
  }

  const getDecantImage = (decant: Decant) => {
    const imageUrl = decant.Imagen_url || ""
    
    if (!imageUrl || imageUrl.trim() === "") {
      return "/placeholder.svg?height=320&width=320"
    }
    
    // Si la URL ya es un proxy (comienza con /api/image-proxy), usarla directamente
    if (imageUrl.startsWith('/api/image-proxy')) {
      return imageUrl
    }
    
    // Si es una URL original, convertirla a proxy
    return createProxyImageUrl(imageUrl, 'decant')
  }

  const getDecant5mlPrice = (decant: Decant) => {
    const price = decant["Precio 5 ML"]
    return price && typeof price === 'number' ? price : 0
  }

  const getDecant10mlPrice = (decant: Decant) => {
    const price = decant["Precio 10 Ml"]
    return price && typeof price === 'number' ? price : 0
  }

  useEffect(() => {
    if (decantId) {
      setIsLoading(true)
      
      fetch(`/api/decants?id=${decantId}`)
        .then((res) => res.json())
        .then((data) => {
          setDecant(data)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Error cargando decant desde API:", error)
          setDecant(null)
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [decantId])

  const handleGoBack = () => {
    router.back()
  }

  const handleDirectContact = () => {
    if (!decant) return
    const size = selectedSize
    const price = selectedSize === '5ml' ? getDecant5mlPrice(decant) : getDecant10mlPrice(decant)
    const message = `Hola, estoy interesado/a en el decant: ${getDecantName(decant)} - ${size} ($${price.toLocaleString('es-AR')})`
    const whatsappUrl = `https://wa.me/+5491122773212?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-800 rounded-full mx-auto"
          />
          <p className="text-zinc-600 font-medium">Cargando detalles del decant...</p>
        </motion.div>
      </div>
    )
  }

  if (!decant || !decantId) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
            <Droplets className="h-8 w-8 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-xl font-light text-zinc-900 mb-2">Decant no encontrado</h2>
            <p className="text-zinc-500">El decant que buscas no existe o ha sido removido</p>
          </div>
          <Button onClick={handleGoBack} variant="outline" className="rounded-none border-zinc-200 text-zinc-600 hover:bg-zinc-50">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Decants
          </Button>
        </motion.div>
      </div>
    )
  }

  // Obtener todas las imágenes del decant (por ahora una sola desde Imagen_url)
  const decantImages = decant ? [getDecantImage(decant)] : ["/placeholder.svg?height=500&width=500"]

  const getCurrentPrice = () => {
    if (!decant) return 0
    return selectedSize === '5ml' ? getDecant5mlPrice(decant) : getDecant10mlPrice(decant)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-zinc-100/50 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Button onClick={handleGoBack} variant="ghost" className="mr-4 p-2 hover:bg-zinc-50 rounded-full" aria-label="Volver">
              <ArrowLeft className="h-5 w-5 text-zinc-500" />
            </Button>
            <Image src="/ZR.svg" alt="Zahara" width={60} height={60} />
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="bg-zinc-900 text-white text-xs font-medium px-3 py-1.5 rounded-full">
              Decant
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Galería de imágenes del decant */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="relative h-[500px] rounded-lg overflow-hidden shadow-xl">
              <Image 
                src={decantImages[selectedImageIndex]} 
                alt={getDecantName(decant)} 
                fill 
                className="object-contain md:p-6 lg:p-8" 
              />
              
              {/* Badge flotante */}
              <div className="absolute top-6 left-6">
                <div className="bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg">
                  {getDecantType(decant)}
                </div>
              </div>
            </div>

            {/* Miniaturas */}
            <div className="grid grid-cols-4 gap-4">
              {decantImages.map((image, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative h-24 border-2 rounded-lg transition-all duration-300 ${
                    selectedImageIndex === index 
                      ? 'border-zinc-900 shadow-lg' 
                      : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Vista ${index + 1} de ${decant.Nombre}`}
                    fill
                    className="object-contain md:p-2 rounded-lg"
                  />
                </motion.button>
              ))}
            </div>

            {/* Información adicional */}
            <div className="bg-white/80 backdrop-blur-sm border border-zinc-100/50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-medium text-zinc-900 mb-4">Características del Decant</h3>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-zinc-600" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Duración</p>
                  <p className="text-sm font-medium text-zinc-900">{decant.duracion}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Información del decant */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-zinc-600 font-medium">Decant</span>
                <div className="w-1 h-1 bg-zinc-300 rounded-full"></div>
                <span className="text-sm text-zinc-500">{getDecantType(decant)}</span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-light mt-2 mb-3 text-zinc-900 leading-tight">{getDecantName(decant)}</h1>
              <h2 className="text-xl text-zinc-600 font-medium mb-6">{getDecantType(decant)}</h2>
              
              <p className="text-zinc-600 mb-8 text-lg leading-relaxed">
                Fragancia disponible en formato de decant. Perfecto para probar sin comprometer tu presupuesto.
              </p>
            </div>

            {/* Selector de tamaño */}
            <div className="bg-white/80 backdrop-blur-sm border border-zinc-100/50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-zinc-900 mb-4">Elige tu tamaño</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.button
                  onClick={() => setSelectedSize('5ml')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    selectedSize === '5ml'
                      ? 'border-zinc-900 bg-zinc-50 shadow-lg'
                      : 'border-zinc-200 bg-white hover:border-zinc-400'
                  }`}
                >
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Droplets className="w-4 h-4 text-zinc-600" />
                      <span className="font-medium text-zinc-900">5ml</span>
                    </div>
                    <p className="text-lg font-semibold text-zinc-900">
                      ${getDecant5mlPrice(decant).toLocaleString('es-AR')}
                    </p>
                    <p className="text-xs text-zinc-500">Ideal para probar</p>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => setSelectedSize('10ml')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 relative ${
                    selectedSize === '10ml'
                      ? 'border-zinc-900 bg-zinc-50 shadow-lg'
                      : 'border-zinc-200 bg-white hover:border-zinc-400'
                  }`}
                >
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Droplets className="w-5 h-5 text-zinc-600" />
                      <span className="font-medium text-zinc-900">10ml</span>
                    </div>
                    <p className="text-lg font-semibold text-zinc-900">
                      ${getDecant10mlPrice(decant).toLocaleString('es-AR')}
                    </p>
                    <p className="text-xs text-zinc-500">Mejor valor</p>
                  </div>
                </motion.button>
              </div>

              <div className="text-center text-sm text-zinc-600 bg-zinc-50 rounded-lg p-3">
                Precio seleccionado: <span className="font-semibold text-zinc-900 text-lg">
                  ${getCurrentPrice().toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Notas olfativas */}
            <div className="bg-zinc-50 border border-zinc-100/50 rounded-sm p-6">
              <h3 className="text-lg font-medium text-zinc-900 mb-4">Información Adicional</h3>
              <p className="text-zinc-700">Para más detalles sobre este producto, no dudes en contactarnos.</p>
            </div>

            {/* Acciones principales */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleDirectContact}
                variant="outline"
                className="rounded-none border-zinc-200 text-zinc-800 hover:bg-zinc-50 py-4 transition-all duration-300"
              >
                <Phone className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>

              <Button
                onClick={() => window.open('mailto:zaharashopp@gmail.com', '_blank')}
                variant="outline"
                className="rounded-none border-zinc-200 text-zinc-800 hover:bg-zinc-50 py-4 transition-all duration-300"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
            </div>

            {/* Información de contacto */}
            <div className="bg-zinc-50 border border-zinc-100/50 p-6 rounded-sm">
              <h3 className="text-lg font-light mb-4">¿Interesado en este decant?</h3>
              <p className="text-sm text-zinc-600 mb-4">
                Contáctanos para obtener más información sobre este producto. Disponible en {selectedSize} por ${getCurrentPrice().toLocaleString('es-AR')}.
              </p>
              <div className="flex flex-col space-y-2 text-sm text-zinc-600">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-zinc-500" />
                  <span>+54 9 11 2277-3212</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-zinc-500" />
                  <span>zaharashopp@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Información básica */}
            <div className="bg-zinc-50 border border-zinc-100/50 rounded-sm p-6">
              <h3 className="text-lg font-medium text-zinc-900 mb-4">Información del Producto</h3>
              <div className="space-y-2">
                <p className="text-zinc-700"><span className="font-medium">Nombre:</span> {getDecantName(decant)}</p>
                <p className="text-zinc-700"><span className="font-medium">Tipo:</span> {getDecantType(decant)}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs con información adicional */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <Tabs defaultValue="descripcion" className="bg-zinc-50 rounded-none border border-zinc-100/50 overflow-hidden">
            <TabsList className="grid grid-cols-2 rounded-none bg-zinc-50 border-b border-zinc-100/50">
              <TabsTrigger value="descripcion" className="rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Descripción
              </TabsTrigger>
              <TabsTrigger value="uso" className="rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Cómo Usar
              </TabsTrigger>
            </TabsList>
            <TabsContent value="descripcion" className="p-8">
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-zinc-900">Sobre {getDecantName(decant)}</h3>
                <p className="text-zinc-600 leading-relaxed">
                  Este decant te permite experimentar esta increíble fragancia en un formato accesible y conveniente. 
                  Perfecto para quienes desean probar nuevas fragancias sin comprometer su presupuesto.
                </p>
                <div className="mt-6 p-4 bg-zinc-50 rounded-sm text-center">
                  <div className="text-2xl font-light text-zinc-600">{getDecantType(decant)}</div>
                  <div className="text-sm text-zinc-500">Tipo de Producto</div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="uso" className="p-8">
              <div className="space-y-6">
                <h3 className="text-xl font-medium text-zinc-900">Consejos de Aplicación</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-zinc-900">Cómo aplicar tu decant:</h4>
                    <ul className="space-y-2 text-zinc-600">
                      <li className="flex items-start gap-2">
                        <span className="text-zinc-500 mt-1">•</span>
                        Aplica en puntos de pulso (muñecas, cuello, detrás de las orejas)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-zinc-500 mt-1">•</span>
                        Rocía a 15-20 cm de distancia de la piel
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-zinc-500 mt-1">•</span>
                        No frotes después de aplicar
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-zinc-500 mt-1">•</span>
                        Para mejor duración, aplica sobre piel hidratada
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-zinc-900">Cantidad recomendada:</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-zinc-50 rounded-sm">
                        <span className="text-zinc-700">Uso diario</span>
                        <span className="font-medium text-zinc-900">2-3 pulverizaciones</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-zinc-50 rounded-sm">
                        <span className="text-zinc-700">Ocasiones especiales</span>
                        <span className="font-medium text-zinc-900">4-5 pulverizaciones</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Productos relacionados */}
        <div className="mt-16">
          <RelatedProducts 
            currentProductId={decant.id}
            currentProductType="Decants"
            maxProducts={4}
          />
        </div>
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