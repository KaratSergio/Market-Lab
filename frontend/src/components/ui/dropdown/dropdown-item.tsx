import Link from 'next/link'
import { ReactNode } from 'react'

interface DropdownItemProps {
  href: string
  children: ReactNode
  onClick?: () => void
  className?: string
}

export function DropdownItem({ href, children, onClick, className = '' }: DropdownItemProps) {
  const baseStyles = 'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md'
  const itemStyles = `${baseStyles} ${className}`

  return (
    <Link
      href={href}
      onClick={onClick}
      className={itemStyles}
    >
      {children}
    </Link>
  )
}