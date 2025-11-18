'use client'

import { useState } from 'react'
import Link from 'next/link'


export function UserMenu() {
  const [isLoggedIn, setIsLoggedIn] = useState(false) //! mock data
  const [userName, setUserName] = useState('Alisa') //! mock data

  if (!isLoggedIn) {
    return (
      <Link href="/login">
        <div>
          <span>👤</span>
          <span>Login</span>
        </div>
      </Link>
    )
  }

  return (
    <div>
      <div>
        <span>👤</span>
        <span>{userName}</span>
      </div>
      
      {/* <UserDropdown /> */}
    </div>
  )
}