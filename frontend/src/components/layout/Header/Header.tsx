import { DesktopNav } from './Navigation/DesktopNav'
import { UserMenu } from './User/UserMenu'
import { CartIcon } from './Cart/CartIcon'
import { Logo } from '@/components/ui'

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo href="/" size="lg" />
          
          <DesktopNav />
          
          <div className="flex items-center gap-4">
            <CartIcon />
            <span>|</span>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}