'use client'

import { ReactNode } from 'react'

interface DropdownProps {
  children: ReactNode
  isOpen: boolean
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({ children, isOpen, align = 'left', className = '' }: DropdownProps) {
  if (!isOpen) return null

  const baseStyles = 'absolute top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10'
  const alignmentStyles = align === 'right' ? 'right-0' : 'left-0'
  const dropdownStyles = `${baseStyles} ${alignmentStyles} ${className}`

  return (
    <div className={dropdownStyles}>
      {children}
    </div>
  )
}