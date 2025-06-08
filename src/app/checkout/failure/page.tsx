import { XCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CheckoutFailurePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-medium mb-4">Error en el pago</h1>
        <p className="text-zinc-500 mb-8">
          Lo sentimos, ha ocurrido un error al procesar tu pago. Por favor, intenta nuevamente o contacta con nuestro
          servicio de atención al cliente.
        </p>

        <div className="space-y-4">
          <Button asChild className="w-full rounded-none bg-zinc-900 hover:bg-zinc-800">
            <Link href="/">Volver a la tienda</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

