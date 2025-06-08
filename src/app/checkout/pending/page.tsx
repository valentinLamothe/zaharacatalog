import { Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CheckoutPendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-yellow-100 p-3">
            <Clock className="h-12 w-12 text-yellow-600" />
          </div>
        </div>

        <h1 className="text-2xl font-medium mb-4">Pago pendiente</h1>
        <p className="text-zinc-500 mb-8">
          Tu pago está siendo procesado. Una vez que se complete, recibirás un correo electrónico con los detalles de tu
          compra.
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

