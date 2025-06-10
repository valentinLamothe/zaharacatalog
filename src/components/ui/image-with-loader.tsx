"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ImageWithLoaderProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  skeletonClassName?: string
}

export function ImageWithLoader({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "",
  priority = false,
  sizes,
  skeletonClassName = ""
}: ImageWithLoaderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  // Default sizes for fill images
  const defaultSizes = fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined

  return (
    <div className={cn("relative w-full h-full", fill && "overflow-hidden")}>
      {/* Skeleton loader */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-zinc-100 via-zinc-50 to-zinc-100 animate-pulse",
            "rounded-lg flex items-center justify-center",
            skeletonClassName
          )}
        >
          {/* Elegant loading animation */}
          <div className="flex flex-col items-center space-y-3">
            {/* Rotating circle loader */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, ease: "linear", repeat: Infinity }}
              className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-600 rounded-full"
            />
            
            {/* Loading dots */}
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-2 h-2 bg-zinc-400 rounded-full"
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Error state */}
      {hasError && (
        <div className={cn(
          "absolute inset-0 bg-zinc-50 rounded-lg flex flex-col items-center justify-center text-zinc-400",
          skeletonClassName
        )}>
          <svg
            className="w-12 h-12 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">No disponible</span>
        </div>
      )}

      {/* Actual image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className={cn(fill && "relative w-full h-full")}
      >
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          className={className}
          priority={priority}
          sizes={sizes || defaultSizes}
          onLoad={handleLoad}
          onError={handleError}
        />
      </motion.div>
    </div>
  )
} 