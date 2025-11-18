import Link from 'next/link'

export function CartIcon() {
  const cartItemsCount = 3 //! mock data

  return (
    <Link href="/cart">
      <div>
        <span>🛒</span>
        {cartItemsCount > 0 && (<span>{cartItemsCount}</span>)}
      </div>
    </Link>
  )
}