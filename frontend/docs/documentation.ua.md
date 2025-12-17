## Проект побудований з використанням Next.js з App Router та розділений на три основні шари:

```
┌─────────────────────────────────────────┐
│            Presentation Layer           │ ← Компоненти UI
│         app | components | shared       │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│            Business Logic Layer         │ ← Хуки, стейт, утіліти
│        core (hooks, store,  utils)      │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│           Infrastructure Layer          │ ← API клієнти, конфігурація
│           core (api, constants)         │
└─────────────────────────────────────────┘
```
** data flow : Користувач → Компонент → Хук → API → Бекенд → Хук → Компонент → Користувач **




## Структура каталогів

### app/ - маршрути
```
app/
├── (auth)/                 # Група маршрутів аутентифікації
│   ├── login/              # /login - сторінка входу
│   ├── register/           # /register - сторінка реєстрації
│   └── forgot-password/    # /forgot-password - відновлення пароля
│
├── (customer)/             # Кабінет покупця (захищений)
│   └── customer-dashboard/
│
├── (supplier)/             # Кабінет постачальника (захищений)
│   └── supplier-dashboard/
│
├── (admin)/                # Адмін панель (захищений)
│   └── admin-dashboard/
│
├── (products)/             # Каталог товарів (публічний)
│   ├── [id]/               # /products/[id] - детальна сторінка товару
│   └── page.tsx            # /products - список товарів
│
├── cart/                   # /cart - кошик покупок
├── checkout/               # /checkout - оформлення замовлення
├── layout.tsx              # Головний layout
└── page.tsx                / Головна сторінка
```

** (auth), (customer), (supplier), (admin) - це route groups в Next.js, які дозволяють группувати маршрути без додавання їх до URL. **

### components/ - компоненти 
```
components/
├── ui/                   # Базові UI компоненти (agnostic)
│   ├── Button/           # Кнопки з варіантами: primary, secondary, outline
│   ├── Input/            # Поля вводу з валідацією
│   ├── Modal/            # Модальні вікна
│   └── ...
│
├── layout/              # Компоненти макету
│   ├── Header/          # Заголовок сайту з навігацією
│   ├── Footer/          # Футер
│   └── Sidebar/         # Бічна панель
│
├── product/             # Компоненти для роботи з товарами
│   ├── ProductCard/     # Картка товару в списку
│   ├── ProductGrid/     # Сітка товарів
│   └── ...
│
├── cart/                # Компоненти кошика
│   ├── CartItem/        # Елемент кошика
│   ├── CartSummary/     # Підсумок кошика
│   └── ...
│
└── features/            # Бізнес-компоненти
    ├── auth/            # Аутентифікація та авторизація
    ├── customer/        # Функціонал покупця
    ├── supplier/        # Функціонал постачальника
    └── checkout/        # Оформлення замовлення
```

### core/ - Бізнес-логіка
```
core/
├── api/                 # API клієнти для комунікації з бекендом
│   ├── auth-api.ts      # Аутентифікація: login, register, forgot-password
│   ├── products-api.ts  # Товари: getProducts, getProductById, createProduct
│   ├── orders-api.ts    # Замовлення: createOrder, getOrders
│   └── index.ts         # Експорт всіх API
│
├── store/               # Глобальний стейт (Zustand)
│   ├── authStore.ts     # Стан аутентифікації: user, token, isAuthenticated
│   ├── cartStore.ts     # Стан кошика: items, total, quantity
│   ├── uiStore.ts       # UI стан: theme, sidebarOpen, notifications
│   └── index.ts         # Експорт сторів
│
├── hooks/               # Кастомні React хуки
│   ├── useAuth.ts       # Хук для аутентифікації: login, logout, register
│   ├── useCart.ts       # Хук для роботи з кошиком: addItem, removeItem, clearCart
│   ├── useProducts.ts   # Хук для товарів: fetchProducts, searchProducts
│   └── index.ts         # Експорт хуків
│
├── providers/           # Context провайдери (TanStack Query)
│   ├── QueryProvider.tsx # Провайдер для React Query
│   ├── AuthProvider.tsx  # Провайдер для аутентифікації
│   └── index.tsx         # Об'єднаний провайдер
│
├── utils/               # Утіліти та хелпери
│   ├── api-utils.ts     # Утіліти для HTTP запитів: apiFetch, error handling
│   ├── validation.ts    # Функції валідації форм
│   ├── formatters.ts    # Форматування: цін, дат, рядків
│   └── index.ts         # Експорт утіліт
│
├── constants/           # Константи та конфігурація
│   ├── api.config.ts    # Конфігурація API: endpoints, timeout, retry
│   ├── validation.ts    # Константи валідації: password rules, email regex
│   └── index.ts         # Експорт констант
│
└── types/               # TypeScript типи та інтерфейси
    ├── auth.types.ts    # Типи аутентифікації: User, LoginFormData, AuthResponse
    ├── product.types.ts # Типи товарів: Product, ProductVariant, ProductFilter
    ├── order.types.ts   # Типи замовлень: Order, OrderItem, OrderStatus
    └── index.ts         # Експорт типів
```




## Потоки аутентифікації
### Реєстрація (Multi-step flow)
```
1. ПОЧАТКОВА РЕЄСТРАЦІЯ (/register)
   ├── Варіант A: Email + Password
   │   ├── Валідація email та пароля
   │   ├── POST /auth/register-initial
   │   └→ Створення користувача з regComplete = false
   │
   └── Варіант B: Google OAuth
       ├── Натискання "Sign in with Google"
       ├── Redirect до Google
       ├── Google повертає code
       ├── GET /auth/google/callback?code=...
       └→ Створення користувача з googleId та regComplete = false

2. ВИБІР РОЛІ (/register/role)
   ├── Відображається після успішної початкової реєстрації
   ├── Користувач обирає: Customer або Supplier
   └→ Зберігається вибір в authStore

3. ЗАПОВНЕННЯ ПРОФІЛЮ (/register/customer або /register/supplier)
   ├── Customer: firstName, lastName, phone, address
   ├── Supplier: companyName, registrationNumber, address, phone
   ├── POST /auth/register-complete з JWT токеном
   ├── Оновлення користувача: regComplete = true, roles = ['customer'/'supplier']
   └→ Редирект на відповідний dashboard

4. ОТРИМАННЯ ДОСТУПУ
   └── Customer → /customer-dashboard
   └── Supplier → /supplier-dashboard
```




### Вхід (Login)
```
1. ВВЕДЕННЯ ДАНИХ (/login)
   ├── Email та Password
   ├── POST /auth/login
   ├── Валідація на бекенді
   ├── Генерація JWT токена
   └→ Збереження токена в cookie та authStore...

2. ПЕРЕВІРКА СЕСІЇ
   ├── При кожному завантаженні додатку
   ├── GET /auth/session/user з токеном
   ├── Отримання даних користувача
   └→ Оновлення authStore...
```




### Google OAuth Integration
Компонент: GoogleOAuthButton (features/auth/GoogleOAuthButton.tsx)
```
1. Натискання кнопки → виклик authApi.getGoogleAuthUrl()
2. Отримання URL → redirect до Google
3. Google автентифікація → redirect назад на /auth/google/callback?code=...
4. GoogleCallbackHandler обробляє code:
   ├── GET /auth/google/callback?code=...
   ├── Обмін code на JWT токен
   ├── Перевірка regComplete статусу
   ├── Якщо regComplete = false → redirect до /register/role
   └── Якщо regComplete = true → redirect до dashboard
```




## Ролі користувачів
```
CUSTOMER: 'customer',     // Покупець - купує товари
SUPPLIER: 'supplier',     // Постачальник - продає товари
ADMIN: 'admin',           // Адміністратор - управляє системою
```

Матриця доступу (permissions)
```
-----------------------------------------------------------------
Сторінка	                Customer	 Supplier  	 Admin	   Гість
/ (Home)	                   ✅	      ✅	       ✅	     ✅
/products	                   ✅	      ✅	       ✅	     ✅
/products/[id]	             ✅	      ✅	       ✅	     ✅
/cart	                       ✅	      ❌	       ❌	     ❌
/checkout                  	 ✅	      ❌	       ❌	     ❌
/customer-dashboard	         ✅	      ❌	       ❌	     ❌
/supplier-dashboard	         ❌	      ✅	       ❌	     ❌
/admin-dashboard	           ❌	      ❌	       ✅	     ❌
/login	                     ❌	      ❌	       ❌	     ✅
/register	                   ❌	      ❌	       ❌	     ✅
```






#### ------------------------------
```
Останнє оновлення: Грудень 2025
Версія фронтенду: 1.0.0
Технології: Next.js 16, React 19, TypeScript, Tailwind CSS, Zustand, TanStack Query
```