"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Instagram, Facebook, ChevronLeft, ChevronRight } from "lucide-react"

import { Toaster } from "sonner"
import { useRouter } from "next/navigation"
import { ImageWithLoader } from "@/components/ui/image-with-loader"
import { processMultipleImageUrls, createProxyImageUrl } from "@/utils/image-proxy"

// Constantes para el swipe
const minSwipeDistance = 50

// Datos para el carrusel
const carouselItems = [
  {
    id: 1,
    title: "Tus aromas favoritos en el tamaño ideal",
    description: "Descubre nuestra colección exclusiva de perfumes que expresan tu esencia",
    image: "https://i.imgur.com/iOAK7QP.png",
    cta: "Explorar Decants",
  },
  {
    id: 2,
    title: "3x2 en decants",
    description: "Llevando 3 del mismo precio te llevas uno de REGALO.",
    image: "https://i.imgur.com/vzXpL0d.png",
    cta: "Aprovechalo ya",
  },
  {
    id: 3,
    title: "Club de Nuit: intensidad bajo cero.",
    description: "Frescura potente con un estilo que deja huella. Elegante, profundo y siempre inolvidable.",
    image: "https://i.imgur.com/VBflVVx.jpeg",
    cta: "Descubrir Fragancias",
  },
]

export default function LandingPage() {
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDecants, setIsLoadingDecants] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [decants, setDecants] = useState<Decant[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [activeSection, setActiveSection] = useState<'fragancias' | 'decants'>('fragancias')
  const [searchDecants, setSearchDecants] = useState("")
  const [particlePositions, setParticlePositions] = useState<Array<{left: string, top: string}>>([])
  const [desktopParticlePositions, setDesktopParticlePositions] = useState<Array<{left: string, top: string}>>([])
  const [mobileParticlePositions, setMobileParticlePositions] = useState<Array<{left: string, top: string}>>([])
  const [isClient, setIsClient] = useState(false)

  const router = useRouter()

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

  interface Decant {
    id: number
    Nombre?: string
    Tipo?: string
    "Precio 5 ML"?: number
    "Precio 10 Ml"?: number
    Imagen_url?: string
    [key: string]: string | number | boolean | undefined | null
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
    return "Consultar"
  }

  // Funciones helper para obtener datos de decants
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
    return price && typeof price === 'number' ? `$${price.toLocaleString('es-AR')}` : "Consultar"
  }

  const getDecant10mlPrice = (decant: Decant) => {
    const price = decant["Precio 10 Ml"]
    return price && typeof price === 'number' ? `$${price.toLocaleString('es-AR')}` : "Consultar"
  }

  // Función helper para obtener la primera imagen del producto
  const getProductImage = (product: Product) => {
    const imageUrl = product.Imagen_url || ""
    
    if (!imageUrl || imageUrl.trim() === "") {
      return "/placeholder.svg?height=320&width=320"
    }
    
    // Si la URL ya es un proxy (comienza con /api/image-proxy), usarla directamente
    if (imageUrl.startsWith('/api/image-proxy')) {
      return imageUrl
    }
    
    // Si es una URL original, procesarla
    return processMultipleImageUrls(imageUrl, 'fragrance')
  }

  // Scroll to top on page load/refresh
  useEffect(() => {
    // Force scroll to top when component mounts (page load/refresh)
    window.scrollTo(0, 0)
  }, [])

  // Initialize particle positions only on client to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
    // Generate background particles (12)
    setParticlePositions(
      Array.from({ length: 12 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }))
    )
    // Generate desktop particles (8)
    setDesktopParticlePositions(
      Array.from({ length: 8 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }))
    )
    // Generate mobile particles (6) with fixed positions
    setMobileParticlePositions(
      Array.from({ length: 6 }, (_, i) => ({
        left: `${20 + i * 15}%`,
        top: `${10 + (i % 3) * 30}%`,
      }))
    )
  }, [])

  // Fetch products and decants
  useEffect(() => {
    setIsLoading(true)
    setIsLoadingDecants(true)
    
    let productsLoaded = false
    let decantsLoaded = false
    
    const checkIfAllLoaded = () => {
      if (productsLoaded && decantsLoaded) {
        // Small delay to ensure smooth transition
        setTimeout(() => {
          setIsPageLoading(false)
        }, 500)
      }
    }
    
    // Cargar fragancias
    fetch("api/sheets")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data)
        productsLoaded = true
        checkIfAllLoaded()
      })
      .catch((error) => {
        console.error("Error cargando productos:", error)
        productsLoaded = true
        checkIfAllLoaded()
      })
      .finally(() => {
        setIsLoading(false)
      })
    
    // Cargar decants
    fetch("api/decants")
      .then((res) => res.json())
      .then((data) => {
        setDecants(data)
        decantsLoaded = true
        checkIfAllLoaded()
      })
      .catch((error) => {
        console.error("Error cargando decants:", error)
        decantsLoaded = true
        checkIfAllLoaded()
      })
      .finally(() => {
        setIsLoadingDecants(false)
      })
  }, [])

  // Handle search input change for fragancias
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsFiltering(true)
    setSearch(e.target.value)
    // Short timeout to show the loader
    setTimeout(() => {
      setIsFiltering(false)
    }, 300)
  }

  // Handle search input change for decants
  const handleSearchDecantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchDecants(e.target.value)
  }

  // Filter products - solo por búsqueda
  const filteredProducts = products.filter((product: Product) => {
    // Make search comparison case-insensitive and handle undefined values
    const productName = getProductName(product)
    const searchMatch = !search || productName.toLowerCase().includes(search.toLowerCase())

    return searchMatch
  })

  // Filter decants
  const filteredDecants = decants.filter((decant: Decant) => {
    const searchMatch = !searchDecants || 
      getDecantName(decant).toLowerCase().includes(searchDecants.toLowerCase())
    
    return searchMatch
  })

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1))
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1))
  }, [])

  // Auto-advance carousel - 6 segundos para todas las pantallas
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const interval = setInterval(() => {
      if (!isHovered || isMobile) { // En mobile siempre avanza automáticamente
        nextSlide()
      }
    }, 6000) // 6 segundos para todas las pantallas
    return () => clearInterval(interval)
  }, [nextSlide, isHovered])

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide()
      } else if (e.key === 'ArrowRight') {
        nextSlide()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
  }

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToSection = (section: 'fragancias' | 'decants') => {
    setActiveSection(section)
    const targetId = section === 'fragancias' ? 'products' : 'decants'
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Toaster />
      
      {/* Full page loading overlay */}
      <AnimatePresence>
        {isPageLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-white z-[100] flex items-center justify-center"
          >
            <div className="text-center space-y-6">
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Image src="/ZR.svg" alt="Zahara" width={80} height={80} className="mx-auto" />
              </motion.div>
              
              {/* Loading animation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-800 rounded-full mx-auto"
                />
                <p className="text-sm text-zinc-500 font-light">Cargando fragancias...</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-zinc-100 py-4 px-4 sm:px-6 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-4">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Image src="/ZR.svg" alt="Zahara" width={50} height={50} className="w-[50px] h-[50px]" />
              </div>
              
              {/* Mobile section toggle buttons */}
              <div className="flex gap-2">
                <motion.button
                  onClick={() => scrollToSection('fragancias')}
                  className={`text-xs font-medium px-3 py-2 rounded-full transition-all duration-200 ${
                    activeSection === 'fragancias' 
                      ? 'bg-zinc-900 text-white shadow-lg' 
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Fragancias
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection('decants')}
                  className={`text-xs font-medium px-3 py-2 rounded-full transition-all duration-200 ${
                    activeSection === 'decants' 
                      ? 'bg-zinc-900 text-white shadow-lg' 
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Decants
                </motion.button>
              </div>
            </div>
            
            {/* Search bar in mobile */}
            <div className="relative">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-100/50 to-zinc-50/50 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white rounded-2xl border border-zinc-200/60 shadow-sm transition-all duration-300 focus-within:border-zinc-300 focus-within:shadow-lg group-focus-within:shadow-zinc-200/25">
                  <div className="absolute left-5 top-1/2 transform -translate-y-1/2 z-10">
                    <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-zinc-600 transition-colors duration-300" />
                  </div>
                  
                  <Input
                    placeholder={activeSection === 'fragancias' ? "¿Qué fragancia buscas?" : "¿Qué decant buscas?"}
                    value={activeSection === 'fragancias' ? search : searchDecants}
                    onChange={activeSection === 'fragancias' ? handleSearchChange : handleSearchDecantsChange}
                    className="pl-12 pr-12 py-4 text-sm bg-transparent border-0 focus:ring-0 focus:outline-none placeholder:text-zinc-400 text-zinc-900 rounded-2xl font-medium placeholder:font-normal"
                  />
                  
                  <AnimatePresence>
                    {((activeSection === 'fragancias' && search) || (activeSection === 'decants' && searchDecants)) && (
                      <motion.button
                        initial={{ scale: 0, opacity: 0, rotate: -180 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0, rotate: 180 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        onClick={() => activeSection === 'fragancias' ? setSearch("") : setSearchDecants("")}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-all duration-200 hover:scale-110"
                      >
                        <svg className="w-4 h-4 text-zinc-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </motion.button>
                    )}
                  </AnimatePresence>
                  
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-zinc-50/20 via-white to-zinc-50/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
              
              {/* Enhanced search results counter for mobile */}
              <AnimatePresence>
                {((activeSection === 'fragancias' && search) || (activeSection === 'decants' && searchDecants)) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute top-full left-0 right-0 mt-3 text-center"
                  >
                    <motion.span 
                      className="inline-flex items-center gap-2 text-xs text-zinc-600 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm border border-zinc-100/80"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      {activeSection === 'fragancias' 
                        ? `${filteredProducts.length} ${filteredProducts.length === 1 ? 'fragancia encontrada' : 'fragancias encontradas'}`
                        : `${filteredDecants.length} ${filteredDecants.length === 1 ? 'decant encontrado' : 'decants encontrados'}`
                      }
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image src="/ZR.svg" alt="Zahara" width={60} height={60} className="w-[60px] h-[60px]" />
            </div>
            
            {/* Desktop Navigation */}
            <div className="flex items-center space-x-8">
              <motion.button 
                onClick={() => scrollToSection('fragancias')}
                className={`transition-colors text-sm font-light ${
                  activeSection === 'fragancias' 
                    ? 'text-black border-b-2 border-zinc-900 pb-1' 
                    : 'text-zinc-500 hover:text-black'
                }`}
                whileHover={{ y: -1 }}
                transition={{ duration: 0.2 }}
              >
                Fragancias
              </motion.button>
              <motion.button 
                onClick={() => scrollToSection('decants')}
                className={`transition-colors text-sm font-light ${
                  activeSection === 'decants' 
                    ? 'text-black border-b-2 border-zinc-900 pb-1' 
                    : 'text-zinc-500 hover:text-black'
                }`}
                whileHover={{ y: -1 }}
                transition={{ duration: 0.2 }}
              >
                Decants
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Advanced Animated Carousel */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-50/50 via-white to-zinc-50/30 min-h-screen">
        {/* Advanced ambient lighting with multiple layers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Main ambient light */}
          <motion.div 
            className="absolute top-1/3 right-1/3 w-[600px] h-[600px] bg-gradient-to-br from-zinc-100/30 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.4, 0.6, 0.4],
              x: [0, 20, -10, 0],
              y: [0, -15, 10, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Secondary ambient light */}
          <motion.div 
            className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-zinc-200/20 to-transparent rounded-full blur-2xl"
            animate={{
              scale: [1, 1.1, 0.9, 1],
              opacity: [0.3, 0.5, 0.2, 0.3],
              x: [0, -30, 20, 0],
              y: [0, 10, -25, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          
          {/* Floating particles */}
          {isClient && particlePositions.map((position, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-zinc-300/40 rounded-full"
              style={{
                left: position.left,
                top: position.top,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + (i * 0.5) % 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: (i * 0.4) % 5,
              }}
            />
          ))}
        </div>
        
        <div 
          className="relative h-screen w-full flex items-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Minimal slide navigation dots (desktop only) */}
          <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-20 hidden lg:block">
            <div className="flex flex-col gap-4">
              {carouselItems.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-1 h-8 rounded-full transition-all duration-500 ${
                    currentSlide === index 
                      ? 'bg-zinc-800 shadow-lg' 
                      : 'bg-zinc-300 hover:bg-zinc-500'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>

          {/* Pure content focus */}
          <div className="w-full h-full relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.6,
                  ease: [0.25, 0.25, 0, 1]
                }}
                className="absolute inset-0"
              >
                <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
                  
                  {/* Mobile - Advanced Animations */}
                  <div className="md:hidden w-full">
                    <div className="relative h-full flex flex-col justify-center py-24">
                      
                      {/* Advanced image with 3D effects */}
                      <motion.div
                        initial={{ 
                          opacity: 0, 
                          scale: 0.8, 
                          rotateX: 25,
                          y: 100,
                          filter: "blur(10px)"
                        }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1, 
                          rotateX: 0,
                          y: 0,
                          filter: "blur(0px)"
                        }}
                        transition={{ 
                          duration: 1.2, 
                          delay: 0.2,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        whileHover={{
                          scale: 1.05,
                          rotateY: 8,
                          transition: { duration: 0.6, ease: "easeOut" }
                        }}
                        className="relative h-[450px] sm:h-[380px] lg:h-[320px] mx-4 mb-8 rounded-3xl overflow-hidden group"
                        style={{
                          transformStyle: "preserve-3d",
                          perspective: "1000px"
                        }}
                      >
                        {/* Animated border glow */}
                        <motion.div
                          className="absolute inset-0 rounded-3xl"
                          style={{
                            background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent, rgba(255,255,255,0.1), transparent)",
                            backgroundSize: "400% 400%"
                          }}
                          animate={{
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                          }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                        
                        {/* Floating particles around image */}
                        {isClient && mobileParticlePositions.map((position, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-zinc-400/60 rounded-full"
                            style={{
                              left: position.left,
                              top: position.top,
                            }}
                            animate={{
                              y: [0, -15, 0],
                              opacity: [0.3, 1, 0.3],
                              scale: [0.5, 1.2, 0.5],
                            }}
                            transition={{
                              duration: 2 + (i * 0.3) % 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: i * 0.3,
                            }}
                          />
                        ))}
                        
                        <motion.div
                          className="relative h-full w-full"
                          whileHover={{
                            z: 20,
                            transition: { duration: 0.4 }
                          }}
                        >
                          <ImageWithLoader
                            src={carouselItems[currentSlide].image}
                            alt={carouselItems[currentSlide].title}
                            fill
                            className="object-contain md:p-4 lg:p-6 group-hover:scale-110 transition-transform duration-1000 ease-out"
                            priority
                          />
                        </motion.div>
                        
                        {/* Dynamic shadow effect */}
                        <motion.div
                          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100"
                          style={{
                            background: "radial-gradient(circle at center, rgba(0,0,0,0.1), transparent 60%)",
                            filter: "blur(15px)",
                            transform: "translateY(10px)"
                          }}
                          animate={{
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.div>

                      {/* Enhanced content with staggered animations */}
                      <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="px-4 text-center space-y-6"
                      >
                                                 <motion.h1 
                           className="text-3xl sm:text-4xl font-light text-zinc-900 leading-tight tracking-tight"
                           initial={{ opacity: 0, y: 30, rotateX: 15 }}
                           animate={{ 
                             opacity: 1, 
                             y: 0, 
                             rotateX: 0,
                             backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                           }}
                           transition={{ 
                             duration: 0.8, 
                             delay: 0.6,
                             backgroundPosition: {
                               duration: 6,
                               repeat: Infinity,
                               ease: "linear"
                             }
                           }}
                           style={{
                             background: "linear-gradient(135deg, #18181b, #52525b, #18181b)",
                             backgroundSize: "200% 100%",
                             WebkitBackgroundClip: "text",
                             WebkitTextFillColor: "transparent",
                             backgroundClip: "text",
                           }}
                         >
                          {carouselItems[currentSlide].title}
                        </motion.h1>
                        
                        <motion.p 
                          className="text-lg text-zinc-600 font-light leading-relaxed max-w-md mx-auto"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.8 }}
                        >
                          {carouselItems[currentSlide].description}
                        </motion.p>
                        
                        {/* Enhanced CTA with ripple effect */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6, delay: 1.0 }}
                          className="pt-4"
                        >
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              size="lg"
                              className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-full px-8 py-3 text-base font-medium border-0 shadow-xl transition-all duration-300 relative overflow-hidden group"
                              onClick={() => {
                                const currentId = carouselItems[currentSlide].id
                                if (currentId === 1 || currentId === 2) {
                                  // Botones 1 y 2 van a decants
                                  document.getElementById('decants')?.scrollIntoView({ behavior: 'smooth' })
                                } else if (currentId === 3) {
                                  // Botón 3 va a fragancias
                                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
                                }
                              }}
                            >
                              <motion.div
                                className="absolute inset-0 bg-white/20 rounded-full"
                                initial={{ scale: 0, opacity: 0 }}
                                whileHover={{ 
                                  scale: 1, 
                                  opacity: [0, 0.5, 0],
                                  transition: { duration: 0.6 }
                                }}
                              />
                              <span className="relative z-10">
                                {carouselItems[currentSlide].cta}
                              </span>
                            </Button>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>

                                      {/* Desktop - Advanced Parallax Split */}
                  <div className="hidden md:grid grid-cols-5 gap-16 items-center w-full h-full">
                    
                    {/* Enhanced Content - 2 columns */}
                    <motion.div
                      initial={{ opacity: 0, x: -60, rotateY: -15 }}
                      animate={{ opacity: 1, x: 0, rotateY: 0 }}
                      transition={{ duration: 1.0, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="col-span-2 space-y-8 relative"
                      style={{
                        transformStyle: "preserve-3d"
                      }}
                    >
                      {/* Floating accent elements */}
                      <motion.div
                        className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-br from-zinc-200/20 to-transparent rounded-full blur-xl"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.5],
                          x: [0, 10, -5, 0],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      
                      <div className="space-y-6 relative">
                        <motion.h1 
                          className="text-5xl xl:text-6xl font-light leading-[0.9] tracking-tight"
                          initial={{ opacity: 0, y: 40, rotateX: 20 }}
                          animate={{ 
                            opacity: 1, 
                            y: 0, 
                            rotateX: 0,
                          }}
                          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                          style={{
                            background: "linear-gradient(135deg, #18181b 0%, #71717a 50%, #18181b 100%)",
                            backgroundSize: "200% 100%",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                          }}
                          whileHover={{
                            scale: 1.02,
                            transition: { duration: 0.3 }
                          }}
                        >
                          <motion.span
                            animate={{
                              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                            }}
                            transition={{
                              duration: 8,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            style={{
                              background: "inherit",
                              backgroundSize: "inherit",
                              WebkitBackgroundClip: "text",
                              backgroundClip: "text",
                            }}
                          >
                            {carouselItems[currentSlide].title}
                          </motion.span>
                        </motion.h1>
                        
                        <motion.p 
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.6 }}
                          className="text-xl text-zinc-600 font-light leading-relaxed relative"
                        >
                          <motion.span
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.2, delay: 0.8 }}
                            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-zinc-300 to-transparent"
                          />
                          {carouselItems[currentSlide].description}
                        </motion.p>
                      </div>

                      {/* CTA with advanced effects */}
                      <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.8, delay: 1.0 }}
                        className="relative"
                      >
                        <motion.div
                          whileHover={{ 
                            scale: 1.05,
                            rotateY: 5,
                            transition: { duration: 0.4 }
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            size="lg"
                            className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-none px-8 py-4 text-sm tracking-wider uppercase font-light border-0 shadow-2xl transition-all duration-500 relative overflow-hidden group"
                            onClick={() => {
                              const currentId = carouselItems[currentSlide].id
                              if (currentId === 1 || currentId === 2) {
                                // Botones 1 y 2 van a decants
                                document.getElementById('decants')?.scrollIntoView({ behavior: 'smooth' })
                              } else if (currentId === 3) {
                                // Botón 3 va a fragancias
                                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
                              }
                            }}
                          >
                            {/* Shimmer effect */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                              initial={{ x: "-100%" }}
                              whileHover={{ 
                                x: "100%",
                                transition: { duration: 0.8 }
                              }}
                            />
                            
                            {/* Pulse effect */}
                            <motion.div
                              className="absolute inset-0 bg-white/5 rounded-none"
                              animate={{
                                scale: [1, 1.05, 1],
                                opacity: [0, 0.3, 0],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                            
                            <span className="relative z-10">
                              {carouselItems[currentSlide].cta}
                            </span>
                          </Button>
                        </motion.div>
                      </motion.div>
                    </motion.div>

                    {/* Enhanced 3D Image - 3 columns */}
                    <motion.div
                      initial={{ 
                        opacity: 0, 
                        x: 80, 
                        scale: 0.9,
                        rotateY: 20,
                        z: -100
                      }}
                      animate={{ 
                        opacity: 1, 
                        x: 0, 
                        scale: 1,
                        rotateY: 0,
                        z: 0
                      }}
                      transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="col-span-3 relative h-[550px] xl:h-[600px] group"
                      style={{
                        transformStyle: "preserve-3d",
                        perspective: "1000px"
                      }}
                      whileHover={{
                        scale: 1.03,
                        rotateY: -8,
                        transition: { duration: 0.6, ease: "easeOut" }
                      }}
                    >
                      {/* Floating background elements */}
                      {isClient && desktopParticlePositions.map((position, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-zinc-300/30 rounded-full"
                          style={{
                            left: position.left,
                            top: position.top,
                          }}
                          animate={{
                            y: [0, -20, 0],
                            opacity: [0.2, 0.8, 0.2],
                            scale: [0.5, 1.5, 0.5],
                          }}
                          transition={{
                            duration: 3 + (i * 0.4) % 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: (i * 0.25) % 2,
                          }}
                        />
                      ))}
                      
                      <motion.div
                        className="relative h-full w-full rounded-2xl overflow-hidden"
                        style={{
                          transformStyle: "preserve-3d"
                        }}
                      >
                        {/* Advanced layered glow effects */}
                        <motion.div
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent, rgba(255,255,255,0.05), transparent)",
                            backgroundSize: "400% 400%"
                          }}
                          animate={{
                            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                          }}
                          transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                        
                        <motion.div
                          className="relative h-full w-full"
                          whileHover={{
                            z: 30,
                            transition: { duration: 0.5 }
                          }}
                        >
                          <ImageWithLoader
                            src={carouselItems[currentSlide].image}
                            alt={carouselItems[currentSlide].title}
                            fill
                            className="object-contain md:p-4 lg:p-6 group-hover:scale-110 transition-transform duration-1200 ease-out"
                          />
                        </motion.div>
                        
                        {/* Dynamic reflection effect */}
                        <motion.div
                          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
                          style={{
                            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 50%)",
                            filter: "blur(20px)"
                          }}
                          animate={{
                            rotate: [0, 360],
                          }}
                          transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Minimal navigation (desktop) */}
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20 hidden lg:flex flex-col gap-2">
            <button
              onClick={prevSlide}
              className="group p-2 hover:bg-white/80 rounded-full transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronLeft className="h-5 w-5 text-zinc-600 group-hover:text-zinc-900 transition-colors" />
            </button>

            <button
              onClick={nextSlide}
              className="group p-2 hover:bg-white/80 rounded-full transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-900 transition-colors" />
            </button>
          </div>

          {/* Minimal progress indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex items-center gap-2">
              {carouselItems.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    currentSlide === index 
                      ? 'w-8 bg-zinc-800' 
                      : 'w-2 bg-zinc-300 hover:bg-zinc-500'
                  }`}
                  whileHover={{ scale: 1.1 }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Section - Now Fragancias */}
      <section id="products" className="py-20 px-4 sm:px-6 bg-white relative overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative">
          {/* Enhanced section title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-light text-zinc-900 mb-4 tracking-tight">
              Nuestras Fragancias
            </h2>
            <div className="w-16 h-px bg-zinc-300 mx-auto"></div>
          </motion.div>

          {/* Desktop Search Interface for Fragancias */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-16 hidden md:block"
          >
            <div className="max-w-xl mx-auto">
              <div className="relative group">
                {/* Floating background effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-zinc-100/40 via-zinc-50/40 to-zinc-100/40 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                
                {/* Main search container */}
                <div className="relative bg-white rounded-3xl shadow-xl border border-zinc-100/80 transition-all duration-500 group-focus-within:shadow-2xl group-focus-within:shadow-zinc-200/25 group-focus-within:border-zinc-200">
                  {/* Search icon with animation */}
                  <div className="absolute left-7 top-1/2 transform -translate-y-1/2 z-10">
                    <motion.div
                      animate={{ 
                        scale: search ? [1, 1.1, 1] : 1,
                        rotate: search ? [0, 5, -5, 0] : 0
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-600 transition-colors duration-300" />
                    </motion.div>
                  </div>
                  
                  {/* Input field */}
                  <Input
                    placeholder="Descubre tu fragancia perfecta..."
                    value={search}
                    onChange={handleSearchChange}
                    className="pl-16 pr-16 py-7 text-lg bg-transparent border-0 focus:ring-0 focus:outline-none placeholder:text-zinc-400 text-zinc-900 rounded-3xl font-medium placeholder:font-normal"
                  />
                  
                  {/* Enhanced clear button */}
                  <AnimatePresence>
                    {search && (
                      <motion.button
                        initial={{ scale: 0, opacity: 0, rotate: -180 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0, rotate: 180 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        onClick={() => setSearch("")}
                        className="absolute right-6 top-1/2 transform -translate-y-1/2 p-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-all duration-200 hover:scale-110 hover:shadow-md group"
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg className="w-4 h-4 text-zinc-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </motion.button>
                    )}
                  </AnimatePresence>
                  
                  {/* Multi-layer glow effects */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-50/20 via-purple-50/20 to-blue-50/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  <div className="absolute inset-px rounded-3xl bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                
                {/* Search suggestions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: search ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-full left-0 right-0 mt-4 text-center"
                >
                  <motion.div
                    initial={{ y: -10, scale: 0.95 }}
                    animate={{ y: 0, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="inline-flex items-center gap-3 text-sm text-zinc-600 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-lg border border-zinc-100/80"
                  >
                    <motion.div 
                      className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    ></motion.div>
                    <span className="font-medium">
                      {filteredProducts.length} {filteredProducts.length === 1 ? 'fragancia encontrada' : 'fragancias encontradas'}
                    </span>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border border-zinc-300 border-t-zinc-600 rounded-full"
                    ></motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Loading State with skeleton cards */}
          {isLoading || isFiltering ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group"
                >
                  <Card className="overflow-hidden border-0 shadow-lg h-full rounded-2xl bg-white">
                    {/* Skeleton image */}
                    <div className="relative aspect-square sm:h-[380px] lg:h-[320px] overflow-hidden rounded-t-2xl">
                      <div className="w-full h-full bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]"></div>
                    </div>
                    
                    {/* Skeleton content */}
                    <CardContent className="p-4 lg:p-6 space-y-3 lg:space-y-4">
                      <div className="space-y-2 lg:space-y-3">
                        <div className="h-4 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded"></div>
                        <div className="flex justify-between items-center">
                          <div className="h-6 w-16 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded-full"></div>
                          <div className="h-4 w-20 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded"></div>
                        </div>
                      </div>
                      <div className="h-8 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded-xl"></div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-6"
              >
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-zinc-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-light text-zinc-900">No encontramos esa fragancia</h3>
                  <p className="text-zinc-500 max-w-md mx-auto">
                    Intenta con otro término o explora todas nuestras fragancias disponibles
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSearch("")}
                  className="mt-6 rounded-full border-zinc-200 text-zinc-600 hover:bg-zinc-50 px-6 py-2 transition-all duration-200 hover:scale-105"
                >
                  Ver todas las fragancias
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            /* Enhanced products grid */
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={getProductId(product)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={!isPageLoading ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: !isPageLoading ? index * 0.05 : 0,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    y: -2,
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                  className="group"
                >
                  <Card className="overflow-hidden border-0 shadow-lg h-full rounded-2xl bg-white group-hover:shadow-xl transition-all duration-500 relative">
                    
                    <div className="relative aspect-square sm:h-[380px] lg:h-[320px] overflow-hidden rounded-t-2xl">
                      <ImageWithLoader
                        src={getProductImage(product)}
                        alt={getProductName(product)}
                        fill
                        className="object-cover md:p-2 lg:p-4 group-hover:scale-105 transition-transform duration-700 ease-out"
                        skeletonClassName="rounded-t-2xl"
                      />
                      
                      {/* Enhanced background pattern */}
                      <div className="absolute inset-0 -z-10" />
                      <div className="absolute inset-0 -z-10" />
                      
                      {/* Subtle overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                      
                      {/* Minimal favorite button */}
                      <motion.div 
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <button className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg hover:bg-white transition-colors duration-200">
                          <svg className="w-3 h-3 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </motion.div>
                      
                      {/* Quick view overlay */}
                      <motion.div 
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/5 backdrop-blur-[1px]"
                        initial={false}
                      >
                        <Button
                          size="sm"
                          className="bg-white/95 text-zinc-800 hover:bg-white border-0 shadow-lg rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm hover:scale-105 transition-all duration-200"
                          onClick={() => {
                            const productId = getProductId(product)
                            router.push(`/producto/${productId}?id=${productId}`)
                          }}
                        >
                          Ver Información
                        </Button>
                      </motion.div>
                    </div>

                    <CardContent className="p-4 lg:p-6 space-y-3 lg:space-y-4 relative">
                      <div className="space-y-2 lg:space-y-3">
                        <h3 className="text-sm sm:text-base lg:text-lg font-medium leading-tight text-zinc-900 group-hover:text-zinc-800 transition-colors duration-300 line-clamp-2">
                          {getProductName(product)}
                        </h3>
                        
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <span className="text-xs px-2 py-1 sm:px-3 sm:py-1.5 bg-zinc-50 text-zinc-600 rounded-full border border-zinc-100 group-hover:bg-zinc-100 transition-colors duration-300 text-center sm:text-left">
                            {product.Tipo}
                          </span>
                          <span className="font-medium text-zinc-900 text-sm lg:text-base text-center sm:text-right">
                            {getProductPrice(product)}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm rounded-xl border-zinc-200 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all duration-300 py-2 lg:py-3"
                        onClick={() => {
                          const productId = getProductId(product)
                          router.push(`/producto/${productId}?id=${productId}`)
                        }}
                      >
                        <motion.span
                          className="flex items-center justify-center gap-2"
                          whileTap={{ scale: 0.95 }}
                        >
                          Ver Información
                          <motion.svg 
                            className="w-3 h-3" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </motion.svg>
                        </motion.span>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Decants Section */}
      <section id="decants" className="py-20 px-4 sm:px-6 bg-white relative overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative">
          {/* Enhanced section title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-light text-zinc-900 mb-4 tracking-tight">
              Nuestros Decants
            </h2>
            <div className="w-16 h-px bg-zinc-300 mx-auto"></div>
          </motion.div>

          {/* Desktop Search Interface for Decants */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-16 hidden md:block"
          >
            <div className="max-w-xl mx-auto">
              <div className="relative group">
                {/* Floating background effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-zinc-100/40 via-zinc-50/40 to-zinc-100/40 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                
                {/* Main search container */}
                <div className="relative bg-white rounded-3xl shadow-xl border border-zinc-100/80 transition-all duration-500 group-focus-within:shadow-2xl group-focus-within:shadow-zinc-200/25 group-focus-within:border-zinc-200">
                  {/* Search icon with animation */}
                  <div className="absolute left-7 top-1/2 transform -translate-y-1/2 z-10">
                    <motion.div
                      animate={{ 
                        scale: searchDecants ? [1, 1.1, 1] : 1,
                        rotate: searchDecants ? [0, 5, -5, 0] : 0
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-600 transition-colors duration-300" />
                    </motion.div>
                  </div>
                  
                  {/* Input field */}
                  <Input
                    placeholder="Descubre tu decant perfecto..."
                    value={searchDecants}
                    onChange={handleSearchDecantsChange}
                    className="pl-16 pr-16 py-7 text-lg bg-transparent border-0 focus:ring-0 focus:outline-none placeholder:text-zinc-400 text-zinc-900 rounded-3xl font-medium placeholder:font-normal"
                  />
                  
                  {/* Enhanced clear button */}
                  <AnimatePresence>
                    {searchDecants && (
                      <motion.button
                        initial={{ scale: 0, opacity: 0, rotate: -180 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0, rotate: 180 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        onClick={() => setSearchDecants("")}
                        className="absolute right-6 top-1/2 transform -translate-y-1/2 p-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-all duration-200 hover:scale-110 hover:shadow-md group"
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg className="w-4 h-4 text-zinc-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </motion.button>
                    )}
                  </AnimatePresence>
                  
                  {/* Multi-layer glow effects */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-50/20 via-purple-50/20 to-blue-50/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  <div className="absolute inset-px rounded-3xl bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                
                {/* Search suggestions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: searchDecants ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-full left-0 right-0 mt-4 text-center"
                >
                  <motion.div
                    initial={{ y: -10, scale: 0.95 }}
                    animate={{ y: 0, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="inline-flex items-center gap-3 text-sm text-zinc-600 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-lg border border-zinc-100/80"
                  >
                    <motion.div 
                      className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    ></motion.div>
                    <span className="font-medium">
                      {filteredDecants.length} {filteredDecants.length === 1 ? 'decant encontrado' : 'decants encontrados'}
                    </span>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border border-zinc-300 border-t-zinc-600 rounded-full"
                    ></motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Decants Grid */}
          {isLoadingDecants ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={`decant-skeleton-${index}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group"
                >
                  <Card className="overflow-hidden border-0 shadow-lg h-full rounded-2xl bg-white">
                    {/* Skeleton image */}
                    <div className="relative aspect-square sm:h-[380px] lg:h-[320px] overflow-hidden rounded-t-2xl">
                      <div className="w-full h-full bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]"></div>
                    </div>
                    
                    {/* Skeleton content */}
                    <CardContent className="p-4 lg:p-6 space-y-3 lg:space-y-4">
                      <div className="space-y-2 lg:space-y-3">
                        <div className="h-4 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded"></div>
                        <div className="flex justify-between items-center">
                          <div className="h-6 w-16 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded-full"></div>
                          {/* Pricing skeleton */}
                          <div className="bg-zinc-100 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="h-3 w-8 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded"></div>
                              <div className="h-3 w-12 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded"></div>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="h-3 w-10 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded"></div>
                              <div className="h-3 w-12 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="h-8 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded-xl"></div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : filteredDecants.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-6"
              >
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-zinc-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-light text-zinc-900">No encontramos ese decant</h3>
                  <p className="text-zinc-500 max-w-md mx-auto">
                    Intenta con otro término o explora todos nuestros decants disponibles
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSearchDecants("")}
                  className="mt-6 rounded-full border-zinc-200 text-zinc-600 hover:bg-zinc-50 px-6 py-2 transition-all duration-200 hover:scale-105"
                >
                  Ver todos los decants
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            /* Enhanced decants grid using same style as fragancias */
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {filteredDecants.map((decant, index) => (
                <motion.div
                  key={decant.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={!isPageLoading ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: !isPageLoading ? index * 0.05 : 0,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    y: -2,
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                  className="group"
                >
                  <Card className="overflow-hidden border-0 shadow-lg h-full rounded-2xl bg-white group-hover:shadow-xl transition-all duration-500 relative">
                    
                    <div className="relative aspect-square sm:h-[380px] lg:h-[320px] overflow-hidden rounded-t-2xl">
                      <ImageWithLoader
                        src={getDecantImage(decant)}
                        alt={getDecantName(decant)}
                        fill
                        className="object-cover md:p-2 lg:p-4 group-hover:scale-105 transition-transform duration-700 ease-out"
                        skeletonClassName="rounded-t-2xl"
                      />
                      
                      {/* Enhanced background pattern */}
                      <div className="absolute inset-0 -z-10" />
                      <div className="absolute inset-0 -z-10" />
                      
                      {/* Subtle overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                      
                      {/* Minimal favorite button */}
                      <motion.div 
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <button className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg hover:bg-white transition-colors duration-200">
                          <svg className="w-3 h-3 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </motion.div>
                      
                      {/* Quick view overlay */}
                      <motion.div 
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/5 backdrop-blur-[1px]"
                        initial={false}
                      >
                        <Button
                          size="sm"
                          className="bg-white/95 text-zinc-800 hover:bg-white border-0 shadow-lg rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm hover:scale-105 transition-all duration-200"
                          onClick={() => {
                            router.push(`/decant/${decant.id}?id=${decant.id}`)
                          }}
                        >
                          Ver Información
                        </Button>
                      </motion.div>
                    </div>

                    <CardContent className="p-4 lg:p-6 space-y-3 lg:space-y-4 relative">
                      <div className="space-y-2 lg:space-y-3">
                        <h3 className="text-sm sm:text-base lg:text-lg font-medium leading-tight text-zinc-900 group-hover:text-zinc-800 transition-colors duration-300 line-clamp-2">
                          {getDecantName(decant)}
                        </h3>
                        
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <span className="text-xs px-2 py-1 sm:px-3 sm:py-1.5 bg-zinc-50 text-zinc-600 rounded-full border border-zinc-100 group-hover:bg-zinc-100 transition-colors duration-300 text-center sm:text-left">
                            {getDecantType(decant)}
                          </span>
                          
                          {/* Pricing Options */}
                          <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-zinc-700">5ml</span>
                              <span className="font-semibold text-zinc-900">
                                {getDecant5mlPrice(decant)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-zinc-700">10ml</span>
                              <span className="font-semibold text-zinc-900">
                                {getDecant10mlPrice(decant)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm rounded-xl border-zinc-200 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all duration-300 py-2 lg:py-3"
                        onClick={() => {
                          router.push(`/decant/${decant.id}?id=${decant.id}`)
                        }}
                      >
                        <motion.span
                          className="flex items-center justify-center gap-2"
                          whileTap={{ scale: 0.95 }}
                        >
                          Ver Información
                          <motion.svg 
                            className="w-3 h-3" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </motion.svg>
                        </motion.span>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 bg-zinc-900 text-white p-3 rounded-full shadow-xl hover:bg-zinc-800 transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-400 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-sm font-normal text-white mb-6 tracking-wide">ZAHARA</h3>
              <p className="text-zinc-500 text-sm font-light">Fragancias exclusivas que definen tu personalidad y despiertan tus sentidos.</p>
              <div className="flex space-x-6 mt-8">
                <a href="https://www.instagram.com/zaharaa.shop/" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61574887287155" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                  <Facebook className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-normal text-white mb-6 tracking-wide">FRAGANCIAS</h4>
              <ul className="space-y-4">
                <li>
                  <a href="#products" className="text-zinc-500 hover:text-white transition-colors text-sm font-light">
                    Ver Todas las Fragancias
                  </a>
                </li>

                <li>
                  <a href="#products" className="text-zinc-500 hover:text-white transition-colors text-sm font-light">
                    Catálogo Completo
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-normal text-white mb-6 tracking-wide">CONTACTO</h4>
              <ul className="space-y-4">
                <li>
                  <a href="mailto:zaharashopp@gmail.com" className="text-zinc-500 hover:text-white transition-colors text-sm font-light">
                    zaharashopp@gmail.com
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/+5491122773212" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors text-sm font-light">
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-800 mt-16 pt-8 text-center text-zinc-600">
            <p className="text-xs font-light">© {new Date().getFullYear()} Zahara. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
