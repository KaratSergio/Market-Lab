'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Dropdown, DropdownItem } from '@/components/ui'

interface NavDropdownItem {
  href: string
  label: string
}

interface NavItem {
  href?: string
  label: string
  dropdown: NavDropdownItem[]
}

export function DesktopNav() {
  const pathname = usePathname()
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const navItems: NavItem[] = [
    { 
      href: '/our-plans', 
      label: 'Our Plans',
      dropdown: []
    },
    { 
      label: 'About Us',
      dropdown: [
        { href: '/about-us/menu-item-1', label: 'Пункт меню 1' },
        { href: '/about-us/menu-item-2', label: 'Пункт меню 2' }
      ]
    },
    { 
      label: 'Our Menus',
      dropdown: [
        { href: '/our-menus/menu', label: 'Menu' },
        { href: '/our-menus/menu-item-2', label: 'Пункт меню 2' }
      ]
    },
    { 
      href: '/gift-cards', 
      label: 'Gift Cards',
      dropdown: []
    },
    { 
      label: 'Sustainability',
      dropdown: [
        { href: '/sustainability/menu-item-1', label: 'Пункт меню 1' },
        { href: '/sustainability/menu-item-2', label: 'Пункт меню 2' }
      ]
    },
    { 
      label: 'Partnerships',
      dropdown: [
        { href: '/partnerships/menu-item-1', label: 'Пункт меню 1' },
        { href: '/partnerships/menu-item-2', label: 'Пункт меню 2' }
      ]
    },
  ]

  const isNavItemActive = (item: NavItem): boolean => {
    if (!item.dropdown.length) return pathname === item.href
    return item.dropdown.some(dropdownItem => pathname === dropdownItem.href)
  }

  return (
    <nav className="flex gap-6">
      {navItems.map((item) => (
        <div 
          key={item.label}
          className="relative"
          onMouseEnter={() => item.dropdown.length > 0 && setActiveDropdown(item.label)}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          {item.href ? (
            <Link
              href={item.href}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isNavItemActive(item)
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={`px-3 py-2 rounded-md text-sm font-medium cursor-default ${
                isNavItemActive(item)
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700'
              }`}
            >
              {item.label}
            </span>
          )}

          {item.dropdown.length > 0 && activeDropdown === item.label && (
            <Dropdown isOpen={true}>
              {item.dropdown.map((dropdownItem) => (
                <DropdownItem 
                  key={dropdownItem.href} 
                  href={dropdownItem.href}
                  className={pathname === dropdownItem.href ? 'bg-blue-50 text-blue-700' : ''}
                >
                  {dropdownItem.label}
                </DropdownItem>
              ))}
            </Dropdown>
          )}
        </div>
      ))}
    </nav>
  )
}