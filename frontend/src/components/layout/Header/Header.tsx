import { DesktopNav } from './navigation/desktop-nav';
import { UserMenu } from './user/user-menu';
import { CartIcon } from './cart/cart-icon';
import { Logo } from '@/components/ui';

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo href="/" size="lg" />
          
          <DesktopNav />
          
          <div className="flex items-center gap-4">
            <CartIcon />
            <span className="text-gray-300">|</span>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}