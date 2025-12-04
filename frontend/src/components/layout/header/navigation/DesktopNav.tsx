'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function DesktopNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/products',
      label: 'products',
    },
    {
      href: '/map',
      label: 'map',
    },
    {
      href: '/sellers',
      label: 'sellers',
    },
    {
      href: '/about',
      label: 'about',
    },
  ]

  return (
    <nav className="flex items-center gap-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === item.href
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}