import React from 'react';
import { cn } from '@/core/utils/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    const hasError = Boolean(error);
    
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors',
            'placeholder:text-gray-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError 
              ? 'border-red-500 focus-visible:ring-red-500' 
              : 'border-gray-300 focus-visible:ring-blue-500 focus-visible:border-blue-500',
            className
          )}
          ref={ref}
          {...props}
        />
        
        {/* Display the error text if error is a string */}
        {typeof error === 'string' && error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };