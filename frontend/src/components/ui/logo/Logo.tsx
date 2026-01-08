'use client'

import Link from 'next/link'
import { SIZE_STYLES, COLORS, FARM_ICONS } from './constants'

interface LogoProps {
  className?: string
  href?: string
  size?: 'sm' | 'md' | 'lg'
  showSubtitle?: boolean
  variant?: 'default' | 'minimal' | 'icon-only'
  icon?: string
  iconIndex?: number
}

export function Logo({
  className = '',
  href = '/',
  size = 'md',
  showSubtitle = true,
  variant = 'default',
  icon,
  iconIndex
}: LogoProps) {
  const currentSize = SIZE_STYLES[size]

  // Select an icon: if iconIndex is passed, take it from the list, or the default one
  const selectedIcon = icon
    ? icon
    : iconIndex !== undefined
      ? FARM_ICONS[iconIndex % FARM_ICONS.length]
      : '🥬' // default icon

  // Icon only
  if (variant === 'icon-only') {
    const iconContent = (
      <div className={`relative group ${className}`}>
        <div className={`${currentSize.logoSize} bg-linear-to-br ${COLORS.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
          <div className={`${currentSize.iconSize} bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm`}>
            <span className="text-lg">{selectedIcon}</span>
          </div>
        </div>
        <div className={`absolute -top-1 -right-1 w-4 h-4 ${COLORS.qualityBadge} rounded-full flex items-center justify-center shadow-md`}>
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    )

    if (href) {
      return (
        <Link href={href} className="inline-block">
          {iconContent}
        </Link>
      )
    }

    return iconContent
  }

  // Minimal version (logo + text without subtitle)
  if (variant === 'minimal') {
    const minimalContent = (
      <div className={`inline-flex items-center ${currentSize.container} group cursor-pointer ${className}`}>
        <div className="relative">
          <div className={`${currentSize.logoSize} bg-linear-to-br ${COLORS.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
            <div className={`${currentSize.iconSize} bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm`}>
              <span className="text-lg">{selectedIcon}</span>
            </div>
          </div>
          <div className={`absolute -top-1 -right-1 w-4 h-4 ${COLORS.qualityBadge} rounded-full flex items-center justify-center shadow-md`}>
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        <div>
          <h1 className={`font-bold ${currentSize.text}`}>
            <span className={`bg-linear-to-r ${COLORS.textGradientGreen} bg-clip-text text-transparent`}>
              Green
            </span>
            <span className={`bg-linear-to-r ${COLORS.textGradientLime} bg-clip-text text-transparent`}>
              ly
            </span>
          </h1>
        </div>
      </div>
    )

    if (href) {
      return (
        <Link href={href} className="inline-block">
          {minimalContent}
        </Link>
      )
    }

    return minimalContent
  }

  // Full version (default)
  const logoContent = (
    <div className={`inline-flex items-center ${currentSize.container} group cursor-pointer ${className}`}>
      <div className="relative">
        <div className={`${currentSize.logoSize} bg-linear-to-br ${COLORS.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
          <div className={`${currentSize.iconSize} bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm`}>
            <span className="text-lg">{selectedIcon}</span>
          </div>
        </div>

        <div className={`absolute -top-1 -right-1 w-4 h-4 ${COLORS.qualityBadge} rounded-full flex items-center justify-center shadow-md`}>
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>

        <div className={`absolute inset-0 bg-linear-to-br ${COLORS.glow} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}></div>
      </div>

      <div>
        <h1 className={`font-bold ${currentSize.text}`}>
          <span className={`bg-linear-to-r ${COLORS.textGradientGreen} bg-clip-text text-transparent`}>
            Green
          </span>
          <span className={`bg-linear-to-r ${COLORS.textGradientLime} bg-clip-text text-transparent`}>
            ly
          </span>
        </h1>

        {showSubtitle && (
          <div className="flex items-center space-x-2 mt-1">
            <div className={`w-1.5 h-1.5 ${COLORS.pulseDot} rounded-full animate-pulse`}></div>
            <p className={`${currentSize.subtitle} text-gray-600 font-medium tracking-wider`}>
              Свіжі фермерські продукти
            </p>
            <div className={`${currentSize.badge} ${COLORS.ecoBadge} rounded-full font-medium`}>
              🍃 ЕКО
            </div>
          </div>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}