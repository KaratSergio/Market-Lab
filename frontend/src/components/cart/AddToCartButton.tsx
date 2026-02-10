'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAddToCart } from '@/core/hooks/useCart';
import { ShoppingCart } from 'lucide-react';
import type { AddItemToCartDto } from '@/core/types/cartTypes';
import { CartNotification } from '@/components/cart/CartNotification';

interface AddToCartButtonProps {
  productId: string;
  price: number;
  name: string;
  imageUrl?: string;
  maxQuantity?: number;
  className?: string;
  onAddToCart?: (data: { name: string; quantity: number; price: number }) => void;
}

interface NotificationData {
  itemName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export function AddToCartButton({
  productId,
  price,
  name,
  imageUrl,
  maxQuantity = 99,
  className = '',
  onAddToCart,
}: AddToCartButtonProps) {
  const t = useTranslations('Cart');
  const addToCartMutation = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState<NotificationData | null>(null);

  const handleAddToCart = async () => {
    const itemData: AddItemToCartDto = {
      productId,
      quantity,
      price,
      name,
      imageUrl,
    };

    try {
      await addToCartMutation.mutateAsync(itemData);
      setNotificationData({ itemName: name, quantity, price, imageUrl });

      setShowNotification(true);
      if (onAddToCart) onAddToCart({ name, quantity, price });

      setQuantity(1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const increment = () => { if (quantity < maxQuantity) setQuantity(quantity + 1) };
  const decrement = () => { if (quantity > 1) setQuantity(quantity - 1) };

  return (
    <>
      <div className={`flex flex-col space-y-3 ${className}`}>
        {/* Quantity Selector */}
        <div className="flex items-center space-x-4">
          <span className="text-gray-700 font-medium">{t('quantity')}:</span>
          <div className="flex items-center space-x-2 bg-green-50 rounded-full p-1">
            <button
              onClick={decrement}
              disabled={quantity <= 1 || addToCartMutation.isPending}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-700 hover:bg-green-100 transition-colors shadow-sm disabled:opacity-50"
              aria-label={t('decreaseQuantity')}
            >
              -
            </button>
            <span className="w-8 text-center font-bold text-gray-800">
              {quantity}
            </span>
            <button
              onClick={increment}
              disabled={quantity >= maxQuantity || addToCartMutation.isPending}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-700 hover:bg-green-100 transition-colors shadow-sm disabled:opacity-50"
              aria-label={t('increaseQuantity')}
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={addToCartMutation.isPending}
          className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-full font-medium transition-all duration-300 ${addToCartMutation.isPending
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-linear-to-r from-green-600 to-amber-500 text-white hover:shadow-lg hover:-translate-y-0.5'
            }`}
        >
          {addToCartMutation.isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t('adding')}</span>
            </>
          ) : (
            <>
              <ShoppingCart size={20} />
              <span>{t('addToCart')}</span>
            </>
          )}
        </button>

        {/* Error Message */}
        {addToCartMutation.error && (
          <p className="text-red-500 text-sm">
            {addToCartMutation.error.message}
          </p>
        )}
      </div>

      {/* Notification */}
      {showNotification && notificationData && (
        <CartNotification
          itemName={notificationData.itemName}
          quantity={notificationData.quantity}
          price={notificationData.price}
          imageUrl={notificationData.imageUrl}
          onClose={() => {
            setShowNotification(false);
            setNotificationData(null);
          }}
        />
      )}
    </>
  );
}