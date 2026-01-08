import { DesktopNav } from './navigation/DesktopNav';
import { UserMenu } from './user/UserMenu';
import { CartIcon } from '../../cart/CartIcon';
import { Logo } from '@/components/ui';

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo href="/" size="sm" />

          <DesktopNav />

          <div className="flex items-center gap-4">
            <UserMenu />
            <span className="text-gray-300">⟶</span>
            <CartIcon />
          </div>
        </div>
      </div>
    </header>
  );
}