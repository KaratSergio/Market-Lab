
```
FRONTEND

frontend/
├──📁 src/
│   ├──📁 app/                                 == Application pages & routing
│   │   ├──📁 [locale]/                        # locale
│   │   │   ├──📁 (auth)/                      # Auth layout group
│   │   │   │   ├──📁 login/
│   │   │   │   │   └──📄 page.tsx
│   │   │   │   └──📁 register/     
│   │   │   │       └──📄 page.tsx
│   │   │   │
│   │   │   ├──📁 (admin)/                     # Admin cabinet layout group
│   │   │   │   ├──📁 admin-dashboard/
│   │   │   │   │   └──📄 page.tsx
│   │   │   │   └──📄 layout.tsx      
│   │   │   │
│   │   │   ├──📁 (customer)/                  # Customer cabinet layout group
│   │   │   │   ├──📁 customer-dashboard/
│   │   │   │   │   └──📄 page.tsx
│   │   │   │   └──📄 layout.tsx 
│   │   │   │
│   │   │   ├──📁 (supplier)/                  # Supplier cabinet layout group
│   │   │   │   ├──📁 supplier-dashboard/ 
│   │   │   │   │   └──📄 page.tsx
│   │   │   │   └──📄 layout.tsx 
│   │   │   │
│   │   │   ├──📁 (products)/                  # Catalog layout group
│   │   │   │   ├──📁 [id]/                    # Dynamic product detail
│   │   │   │   │   └──📄 page.tsx
│   │   │   │   ├──📄 page.tsx
│   │   │   │   └──📄 layout.tsx
│   │   │   │
│   │   │   ├──📁 cart/                        # Shopping cart pages
│   │   │   │   └──📄 page.tsx
│   │   │   │
│   │   │   ├──📄 layout.tsx                   # Main layout with localization
│   │   │   └──📄 page.tsx                     # Home page for a specific locale
│   │   │
│   │   ├──📄 layout.tsx                       # Global layout (without localization)
│   │   └──📄 page.tsx                         # Redirect page to default locale
│   │
│   ├──📁 components/                          == All components
│   │   ├──📁 ui/                              # Base UI components
│   │   ├──📁 layout/                          # Layout components
│   │   │   ├──📄 Header.tsx                   # Header с LanguageSwitcher
│   │   │   ├──📄 Footer.tsx
│   │   │   └──📄 LangSwitcher.tsx             # Language switch
│   │   ├──📁 product/                         # Product-related components
│   │   ├──📁 cart/                            # Cart-specific components
│   │   ├──📁 features/                        # Business feature components
│   │   └──📄 index.ts                         # Unified components export
│   │
│   ├──📁 shared/                              == Global resources
│   │   ├──📁 styles/                          # Global styles
│   │   │   ├──📄 globals.css                  # Main styles file
│   │   │   └──📄 variables.css                # CSS variables (colors, fonts, etc.)
│   │   │
│   │   └──📁 assets/                          # Fonts, icons, images
│   │
│   └──📁 core/                                == Core application logic
│       ├──📁 api/                             # API functions & clients
│       ├──📁 store/                           # Global state management
│       ├──📁 hooks/                           # Custom React hooks
│       │   ├──📄 useTranslation.ts            # Custom hook for translations
│       │   └──📄 ...                
│       ├──📁 providers/                       # Context providers (tanstack)
│       ├──📁 utils/                           # Helper functions
│       │   ├──📁 i18n/                        # i18n
│       │   │   ├──📄 categories.ts            # Functions for translating categories
│       │   │   ├──📄 productUnits.ts          # Conversion of units of measurement
│       │   │   ├──📄 status.ts                # Translation of statuses
│       │   │   └──📄 index.ts                 # Export all i18n utilities
│       │   └──📄 ...                
│       ├──📁 constants/                       # Constants
│       │   ├──📄 locales.ts                   # Locale constants
│       │   └──📄 ...                
│       └──📁 types/                           # TypeScript type definitions
│
├──📁 public/                                  == Static files
├──📁 messages/                                == Translations
│   ├──📄 en.json                              # English translations
│   └──📄 uk.json                              # Ukrainian translations
│         
├──⚙️  next.config.js                          # Next.js configuration
├──🎨 tailwind.config.ts                       # Tailwind CSS configuration
├──📐 tsconfig.json                            # TypeScript configuration
├──📦 package.json                             # Dependencies & scripts
└──🌐 middleware.ts                            # Localization middleware
```


# Navigation
- Base UI components  [→ Details](#ui-components)
- Layout components   [→ Details](#layout-components)
- Product components  [→ Details](#product-components)
- Cart components     [→ Details](#cart-components)
- Features components [→ Details](#features-components)
- Core components     [→ Details](#core-components)



## UI Components
```
📁 ui/
├──📁 Button/              # Buttons with variants
├──📁 Input/               # Input fields
├──📁 Modal/               # Modal dialogs
├──📁 Select/              # Dropdown selects
├──📁 Checkbox/            # Checkbox inputs
├──📁 Radio/               # Radio buttons
├──📁 Tabs/                # Tab components
├──📁 Accordion/           # Accordion components
├──📁 Badge/               # Badges and labels
├──📁 Loader/              # Loading indicators
├──📁 Toast/               # Notification toasts
└──📄 index.ts             # Unified exports
```


## Common Components
```
📁 features/
├──📁 SearchBar/           # Search bar component
├──📁 Pagination/          # Pagination component
├──📁 Breadcrumbs/         # Breadcrumb navigation
├──📁 Rating/              # Star rating component
├──📁 Price/               # Price formatting component
├──📁 ImageGallery/        # Image gallery component
├──📁 Counter/             # Quantity counter
├──📁 ShareButtons/        # Social share buttons
└──📄 index.ts             # Unified exports
```


## Layout Components
```
📁 layout/
├──📁 Header/              # Site header
│   ├──📄 Header.tsx
│   ├──📁 Navigation/      # Navigation menu
│   ├──📁 UserMenu/        # User dropdown menu
│   └──📁 Search/          # Header search
├──📁 Footer/              # Site footer
│   ├──📄 Footer.tsx
│   ├──📁 LinksSection/    # Links section
│   └──📁 SocialLinks/     # Social media links
├──📁 Sidebar/             # Sidebar panel
│   ├──📄 Sidebar.tsx
│   ├──📁 Filters/         # Sidebar filters
│   └──📁 Categories/      # Categories list
├──📁 MainLayout/          # Main page layout
├──📁 AuthLayout/          # Authentication pages layout
├──📁 DashboardLayout/     # User dashboard layout
└──📄 index.ts             # Unified exports
```


## Features Components
```
📁 features/
├──📁 auth/                               # Authentication & authorization
│   ├──📁 forms/                          # All authentication-related forms
│   │   ├──📄 CustomerProfileForm.tsx     # Customer profile form component
│   │   ├──📄 SupplierProfileForm.tsx     # Supplier profile form component
│   │   ├──📄 RoleSelectionForm.tsx       # Role selection form component
│   │   ├──📄 ResetPasswordForm.tsx       # Reset password form component
│   │   ├──📄 ForgotPasswordForm.tsx      # Forgot password form component
│   │   ├──📄 LoginForm.tsx               # User login form component
│   │   └──📄 RegisterForm.tsx            # User registration form component
│   ├──📄 GoogleCallbackHandler.tsx       # Google callback handler
│   ├──📄 GoogleOAuthButton.tsx           # Google registration button
│   └──📄 RouteGuard.tsx                  # Route protection & access control
├──📁 customer/                           # Customer functionality
│   ├──📁 forms/                          # Customer-specific forms
│   │   ├──📁 ProfileForm/                # Edit customer profile
│   │   ├──📁 OrderForm/                  # Create/edit customer orders
│   │   └──📁 SubscriptionForm/           # Manage subscriptions
│   ├──📁 dashboard/                      # Customer dashboard components
│   └──📁 orders/                         # Order history & management
├──📁 supplier/                           # Supplier functionality
│   ├──📁 forms/                          # Supplier-specific forms
│   │   ├──📁 ProductForm/                # Add/edit products
│   │   ├──📁 InventoryForm/              # Manage inventory levels
│   │   └──📁 SupplierProfileForm/        # Supplier company profile
│   ├──📁 products/                       # Product management UI
│   └──📁 analytics/                      # Supplier performance metrics
└──📁 checkout/                           # Checkout process
    ├──📁 forms/                          # Checkout step forms
    │   ├──📁 DeliveryForm/               # Delivery address & method
    │   ├──📁 PaymentForm/                # Payment information
    │   └──📁 OrderReview/                # Order summary & confirmation
    └──📄 Checkout.tsx                    # Main checkout flow controller
```


## Product Components
```
📁 product/
├──📁 ProductCard/                # Product card for listings
│   ├──📁 ProductCard.tsx
│   ├──📁 ProductImage/           # Product image display
│   ├──📁 ProductPrice/           # Price display block
│   └──📁 ProductActions/         # Action buttons
├──📁 ProductGrid/                # Products grid layout
├──📁 ProductList/                # Products list layout
├──📁 ProductGallery/             # Product image gallery
├──📁 ProductInfo/                # Product information
│   ├──📁 ProductTitle/
│   ├──📁 ProductDescription/
│   ├──📁 ProductAttributes/      # Product specifications
│   └──📁 ProductRating/          # Ratings and reviews
├──📁 ProductVariants/            # Product variants (size, color)
├──📁 ProductRecommendations/     # Product recommendations
├──📁 ProductFilters/             # Product filters
│   ├──📁 PriceFilter/
│   ├──📁 CategoryFilter/
│   └──📁 BrandFilter/
├──📁 ProductSort/                # Product sorting
└──📁 hooks/                      # Product hooks
    ├──📁 useProduct.ts
    ├──📁 useProductList.ts
    └──📁 useProductSearch.ts
```


## Cart Components
```
📁 cart/
├──📁 CartItem/                  # Cart item component
│   ├──📁 CartItem.tsx
│   ├──📁 CartItemImage/         # Item image in cart
│   ├──📁 CartItemInfo/          # Item information in cart
│   └──📁 CartItemActions/       # Quantity management
├──📁 CartList/                  # Cart items list
├──📁 CartSummary/               # Cart summary information
│   ├──📁 CartTotals/            # Total calculations
│   ├──📁 DiscountCode/          # Discount code input
│   └──📁 CheckoutButton/        # Checkout action button
├──📁 CartSidebar/               # Cart sidebar panel
├──📁 CartEmpty/                 # Empty cart state
├──📁 CartPreview/               # Cart preview (in header)
├──📁 AddToCart/                 # Add to cart functionality
│   ├──📁 AddToCartButton/
│   ├──📁 QuantitySelector/      # Quantity selection
│   └──📁 AddToCartForm/
└──📁 hooks/                     # Cart hooks
    ├──📁 useCart.ts
    ├──📁 useCartActions.ts
    └──📁 useCartTotals.ts
```

## Core Components
```
📁 core/                      
├──📁 api/                   # API functions & clients
│   ├──📄 auth-api.ts
│   ├──📄 admin-api.ts
│   └──📄 index.ts
├──📁 store/                 # Global state management
├──📁 hooks/                 # Custom React hooks
├──📁 providers/             # Context providers
├──📁 utils/                 # Helper functions
│   ├──📄 api-utils.ts
│   ├──📄 zod-schemas.ts
│   └──📄 index.ts
├──📁 constants/             # Constants (validation, configs, etc.)
│   ├──📄 api.config.ts      # API configuration
│   ├──📄 validation.ts      # validation constants
│   └──📄 index.ts
└──📁 types/                 # TypeScript type definitions
```