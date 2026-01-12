// EXAMPLE OF USE

// import { Logo, BannerLogo, FARM_ICONS } from '@/components/ui/logo'


// ============= Main logo with default icon
//       <Logo href="/" size = "md" />


// ============= With a specific icon
//       <Logo href="/" size = "md" icon = "🥛" />


// ============= With an icon by index from the list
//       <Logo href="/" size = "md" iconIndex = { 10} /> // the 10th icon from FARM_ICONS


// ============= For a specific category
//       const categoryIcons = {
//         vegetables: '🥬', fruits: '🍎', dairy: '🥛',
//         meat: '🥩', honey: '🍯'
//       }

//      < Logo href = "/vegetables" icon = { categoryIcons.vegetables } />
//      < Logo href="/dairy" icon = { categoryIcons.dairy } />


// ============= Only the icon
//      <Logo href="/" size = "sm" variant = "icon-only" />


// ============= Minimum version
//      <Logo href="/" size = "sm" variant = "minimal" />


// ============= For the banner
//      <BannerLogo />