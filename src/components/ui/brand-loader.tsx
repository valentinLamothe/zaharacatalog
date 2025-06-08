"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BrandLoaderProps {
  size?: "small" | "medium" | "large"
  className?: string
  message?: string
}

export function BrandLoader({ size = "medium", className, message }: BrandLoaderProps) {
  const [rotation, setRotation] = useState(0)
  
  // Continuous rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 120) % 360)
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative">
        {/* Outer spinning circle */}
        <motion.div 
          className={cn(
            "rounded-full border-2 border-zinc-200 flex items-center justify-center",
            size === "small" && "w-16 h-16",
            size === "medium" && "w-24 h-24",
            size === "large" && "w-32 h-32"
          )}
          animate={{ 
            rotate: 360,
            borderColor: ['#e4e4e7', '#71717a', '#e4e4e7']
          }}
          transition={{ 
            rotate: { duration: 3, ease: "linear", repeat: Infinity },
            borderColor: { duration: 3, repeat: Infinity }
          }}
        >
          {/* Inner spinning logo */}
          <motion.div
            className={cn(
              "relative flex items-center justify-center",
              size === "small" && "w-10 h-10",
              size === "medium" && "w-16 h-16",
              size === "large" && "w-20 h-20"
            )}
            animate={{ rotate: rotation }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <Image 
              src="/ZR.svg" 
              alt="Zahara" 
              width={size === "small" ? 20 : size === "medium" ? 32 : 40}
              height={size === "small" ? 20 : size === "medium" ? 32 : 40}
              className="opacity-80"
            />
          </motion.div>
        </motion.div>
        
        {/* Pulsing effect */}
        <motion.div 
          className={cn(
            "absolute inset-0 rounded-full border border-zinc-800 opacity-20",
            size === "small" && "border",
            size === "medium" && "border-2",
            size === "large" && "border-3"
          )}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.1, 0.2]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {message && (
        <motion.p 
          className="mt-4 text-zinc-500 font-light text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  )
}
