export const SIZE_STYLES = {
  sm: {
    container: 'space-x-2',
    logoSize: 'w-8 h-8',
    iconSize: 'w-5 h-5',
    text: 'text-lg',
    subtitle: 'text-xs',
    badge: 'px-1 py-0.5 text-[10px]'
  },
  md: {
    container: 'space-x-3',
    logoSize: 'w-12 h-12',
    iconSize: 'w-7 h-7',
    text: 'text-2xl',
    subtitle: 'text-sm',
    badge: 'px-1.5 py-0.5 text-xs'
  },
  lg: {
    container: 'space-x-4',
    logoSize: 'w-16 h-16',
    iconSize: 'w-10 h-10',
    text: 'text-3xl md:text-4xl',
    subtitle: 'text-base',
    badge: 'px-2 py-1 text-sm'
  }
} as const


export const COLORS = {
  gradient: 'from-emerald-500 to-lime-400',
  textGradientGreen: 'from-emerald-700 via-emerald-600 to-green-500',
  textGradientLime: 'from-lime-600 via-lime-500 to-yellow-400',
  textGradientGreenDark: 'from-emerald-800 via-emerald-600 to-green-500',
  glow: 'from-emerald-400/30 to-lime-300/30',
  glowDark: 'from-emerald-400/40 to-lime-300/40',
  qualityBadge: 'bg-green-500',
  ecoBadge: 'bg-green-100 text-green-800',
  pulseDot: 'bg-green-500'
} as const


export const FARM_ICONS = [
  // Vegetables
  '🥬', '🥦', '🫑', '🥒', '🌶️', '🍅', '🧅', '🧄', '🥔', '🥕',

  // Fruits and berries
  '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒',
  '🍑', '🥭', '🍍', '🥥', '🥝', '🍈', '🍏',

  // Dairy products
  '🥛', '🧈', '🧀', '🥚',

  // Meat and fish
  '🥩', '🍗', '🥓', '🍖', '🐟', '🦐',

  // Cereals and legumes
  '🌾', '🌽', '🫘', '🥜',

  // Spices and honey
  '🍯', '🌿', '🍄',

  // Finished products
  '🍞', '🥐', '🥖',

  // Drinks
  '🍷', '🍺', '🥤',

  // Universal
  '🌱', '🚜', '👨‍🌾', '👩‍🌾', '🏡', '🌻', '🌳'
] as const