import Link from 'next/link'

interface LogoProps {
  className?: string
  href?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', href = '/', size = 'md' }: LogoProps) {
  const sizeStyles = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  const logoContent = (
    <div className={`font-bold text-blue-600 ${sizeStyles[size]} ${className}`}>
      LOGO
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