"use client"

import { Mail, Gift, Tag, Calendar } from "lucide-react"

interface PromotionalEmailProps {
  email: string
  onClose: () => void
}

export function PromotionalEmail({ email, onClose }: PromotionalEmailProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-primary text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Email Promocional
            </h3>
            <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4 pb-4 border-b">
            <p className="text-sm text-gray-500">
              Para: <span className="text-black">{email}</span>
            </p>
            <p className="text-sm text-gray-500">
              Asunto: <span className="text-black">¡Bienvenido a Zahara - Tu 20% de descuento te espera!</span>
            </p>
          </div>

          <div className="space-y-4">
            <p>
              Hola <span className="font-semibold">{email.split("@")[0]}</span>,
            </p>

            <p>¡Gracias por unirte a la familia Zahara!</p>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center text-primary font-bold mb-2">
                <Gift className="mr-2 h-5 w-5" />
                <span>TU REGALO DE BIENVENIDA</span>
              </div>
              <p>
                Como agradecimiento por tu suscripción, queremos ofrecerte un{" "}
                <span className="font-bold">20% de descuento</span> en tu primera compra.
              </p>

              <div className="bg-primary/10 p-3 my-3 rounded text-center">
                <span className="font-bold text-lg text-primary">CÓDIGO: BIENVENIDA20</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="mr-1 h-4 w-4" />
                <span>Válido durante los próximos 30 días</span>
              </div>
            </div>

            <p>Además, como miembro de nuestra comunidad, recibirás:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Acceso anticipado a nuevas colecciones</li>
              <li>Ofertas exclusivas para suscriptores</li>
              <li>Consejos de estilo personalizados</li>
              <li>Invitaciones a eventos especiales</li>
            </ul>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
              <div className="flex items-center text-primary font-bold mb-2">
                <Tag className="mr-2 h-5 w-5" />
                <span>PRODUCTOS DESTACADOS</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center">
                  <div className="bg-gray-200 h-20 rounded-md mb-1"></div>
                  <p className="text-xs font-semibold">Perfume Elegance</p>
                  <p className="text-xs text-gray-500">$89.99</p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-200 h-20 rounded-md mb-1"></div>
                  <p className="text-xs font-semibold">Vestido Elegante</p>
                  <p className="text-xs text-gray-500">$119.99</p>
                </div>
              </div>
            </div>

            <p>¡Esperamos verte pronto en Zahara!</p>

            <p>
              Atentamente,
              <br />
              El equipo de Zahara
            </p>

            <p className="text-sm text-gray-500 italic">
              P.D.: Síguenos en Instagram @ZaharaOficial para más inspiración de moda.
            </p>

            <div className="text-center pt-4 border-t text-xs text-gray-400 mt-4">
              <p>© {new Date().getFullYear()} Zahara. Todos los derechos reservados.</p>
              <p>
                Si no deseas recibir más correos, puedes{" "}
                <a href="#" className="text-primary">
                  darte de baja aquí
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

