"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "sonner"
import { Mail, Phone, MessageSquare } from "lucide-react"

interface ContactFormProps {
  productName: string
  productId: number
  trigger?: React.ReactNode
}

export function ContactForm({ productName, trigger }: Omit<ContactFormProps, 'productId'>) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    consultaType: "informacion",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simular envío del formulario
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Aquí puedes agregar la lógica para enviar el email o guardar en una base de datos
      // console.log("Consulta enviada:", { ...formData, productName, productId, timestamp: new Date().toISOString() })

      toast.success("¡Consulta enviada exitosamente! Te contactaremos pronto.")
      setFormData({ name: "", email: "", phone: "", consultaType: "informacion", message: "" })
      setIsOpen(false)
    } catch {
      toast.error("Error al enviar la consulta. Inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const defaultTrigger = (
    <Button className="w-full rounded-none bg-zinc-900 hover:bg-zinc-800 text-white py-6">
      <MessageSquare className="mr-2 h-4 w-4" />
      Solicitar Información
    </Button>
  )

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-xl font-light">Consulta sobre Producto</SheetTitle>
          <SheetDescription className="text-zinc-600">
            Completa el formulario y te contactaremos pronto para brindarte información sobre <strong>{productName}</strong>.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium block">
              Nombre completo *
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="rounded-none border-zinc-200 focus:border-zinc-400"
              placeholder="Tu nombre completo"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium block">
              Correo electrónico *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="rounded-none border-zinc-200 focus:border-zinc-400"
              placeholder="tu@email.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium block">
              Teléfono
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className="rounded-none border-zinc-200 focus:border-zinc-400"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="consultaType" className="text-sm font-medium block">
              Tipo de consulta *
            </label>
            <select
              id="consultaType"
              name="consultaType"
              required
              value={formData.consultaType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-zinc-200 focus:border-zinc-400 focus:outline-none bg-white"
            >
              <option value="informacion">Información general</option>
              <option value="precio">Consulta de precio</option>
              <option value="detalles">Información de producto</option>
              <option value="personalizacion">Personalización</option>
              <option value="catalogo">Solicitar catálogo completo</option>
              <option value="distribucion">Oportunidad de distribución</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium block">
              Mensaje *
            </label>
            <textarea
              id="message"
              name="message"
              required
              value={formData.message}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-zinc-200 focus:border-zinc-400 focus:outline-none min-h-[100px] resize-none"
              placeholder={`Hola, estoy interesado/a en ${productName}. Me gustaría obtener información sobre...`}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-none"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-none bg-zinc-900 hover:bg-zinc-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar Consulta"}
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-100">
          <p className="text-sm text-zinc-500 text-center mb-4">
            También puedes contactarnos directamente:
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <a 
              href="mailto:zaharashopp@gmail.com" 
              className="flex items-center justify-center p-3 border border-zinc-200 hover:bg-zinc-50 transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </a>
            <a 
              href="https://wa.me/+5491122773212" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center p-3 border border-zinc-200 hover:bg-zinc-50 transition-colors"
            >
              <Phone className="w-4 h-4 mr-2" />
              WhatsApp
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 