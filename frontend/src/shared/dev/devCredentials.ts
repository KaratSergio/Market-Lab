export const devCredentials = {
  admin: {
    email: process.env.NEXT_PUBLIC_DEV_SUPER_ADMIN_EMAIL,
    password: process.env.NEXT_PUBLIC_DEV_ADMIN_PASS,
    label: '🚀 superadmin',
    role: 'admin',
    bgColor: 'bg-red-100 hover:bg-red-200 text-red-900',
  },
  supplier: {
    email: process.env.NEXT_PUBLIC_DEV_SUPPLIER_EMAIL,
    password: process.env.NEXT_PUBLIC_DEV_SUP_PASS,
    label: '📦 supplier',
    role: 'supplier',
    bgColor: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-900',
  },
  customer: {
    email: process.env.NEXT_PUBLIC_DEV_CUSTOMER_EMAIL,
    password: process.env.NEXT_PUBLIC_DEV_CUS_PASS,
    label: '🛒 customer',
    role: 'customer',
    bgColor: 'bg-green-100 hover:bg-green-200 text-green-900',
  },
} as const;

export type DevUserRole = keyof typeof devCredentials;