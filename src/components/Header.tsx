import Link from "next/link"
import { ShoppingBag, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="py-6 px-0 border-b">
      <div className="w-[80%] mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="https://flowersandsaints.com.au" className="text-2xl font-bold tracking-tight">
          Flowers & Saints
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="https://flowersandsaints.com.au"
            className="text-base font-medium text-black hover:text-gray-600 transition-colors"
          >
            Home
          </Link>
          <Link
            href="https://flowersandsaints.com.au/products"
            className="text-base font-medium text-gray-500 hover:text-gray-600 transition-colors"
          >
            Products
          </Link>
          <Link
            href="https://flowersandsaints.com.au/about"
            className="text-base font-medium text-gray-500 hover:text-gray-600 transition-colors"
          >
            About
          </Link>
          <Link
            href="https://flowersandsaints.com.au/contact"
            className="text-base font-medium text-gray-500 hover:text-gray-600 transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingBag className="w-6 h-6" />
          </Button>
          <Button className="bg-black text-white hover:bg-gray-900 rounded text-sm px-4 py-2">Login/Register</Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </header>
  )
}

