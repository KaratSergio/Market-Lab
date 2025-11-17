export interface MenuItem {
  id: string
  title: string
  description: string
  image: string
  cookingTime: string
  calories: string
  rating: number
  reviewsCount: number
  price: string
  tags: string[]
  isPopular?: boolean
}

export const menuItems: MenuItem[] = [
  {
    id: '1',
    title: 'Сирні тако з яловичиною',
    description: 'Пряні тако з соковитою яловичиною, сиром чеддер та свіжими овочами',
    image: '/images/menu/taco-beef.jpg',
    cookingTime: '25-35 хв',
    calories: '650 ккал',
    rating: 4.8,
    reviewsCount: 124,
    price: '299 ₴',
    tags: ['Мексиканська', 'Гостре', 'Сімейне'],
    isPopular: true
  },
  {
    id: '2',
    title: 'Кремова паста з креветками',
    description: 'Феттучіне в вершковому соусі з тигровими креветками та шпинатом',
    image: '/images/menu/pasta-shrimp.jpg',
    cookingTime: '20-30 хв',
    calories: '520 ккал',
    rating: 4.6,
    reviewsCount: 89,
    price: '349 ₴',
    tags: ['Італійська', 'Морепродукти']
  },
  {
    id: '3',
    title: 'Курка теріякі з рисом',
    description: 'Ніжне куряче філе в солодкому соусі теріякі з овочами',
    image: '/images/menu/chicken-teriyaki.jpg',
    cookingTime: '15-25 хв',
    calories: '480 ккал',
    rating: 4.5,
    reviewsCount: 156,
    price: '259 ₴',
    tags: ['Азіатська', 'Здорове']
  },
  {
    id: '4',
    title: 'Вегетаріанська піца',
    description: 'Тонке тісто з томатним соусом, свіжими овочами та моцарелою',
    image: '/images/menu/veg-pizza.jpg',
    cookingTime: '30-40 хв',
    calories: '580 ккал',
    rating: 4.7,
    reviewsCount: 67,
    price: '279 ₴',
    tags: ['Італійська', 'Вегетаріанське']
  },
  {
    id: '5',
    title: 'Лосось з картопляним пюре',
    description: 'Філе лосося на грилі з ніжним картопляним пюре та спаржею',
    image: '/images/menu/salmon-mash.jpg',
    cookingTime: '25-35 хв',
    calories: '550 ккал',
    rating: 4.9,
    reviewsCount: 203,
    price: '379 ₴',
    tags: ['Європейська', 'Преміум'],
    isPopular: true
  },
  {
    id: '6',
    title: 'Бургер з яловичиною',
    description: 'Натуральна яловича котлета з сиром, салатом та соусом',
    image: '/images/menu/beef-burger.jpg',
    cookingTime: '20-30 хв',
    calories: '720 ккал',
    rating: 4.4,
    reviewsCount: 98,
    price: '249 ₴',
    tags: ['Американська', 'Класичне']
  }
]