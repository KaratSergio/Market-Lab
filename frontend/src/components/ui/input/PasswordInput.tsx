'use client';

import React, { useState } from 'react';
import { Input, InputProps } from './Input';
import { cn } from '@/core/utils/cn';

export interface PasswordInputProps extends Omit<InputProps, 'type'> { }

const EyeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeSlashIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          ref={ref}
          className={cn('pr-10', className)}
          error={error}
          {...props}
        />

        <button
          type="button"
          onClick={togglePasswordVisibility}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2",
            "text-gray-500 hover:text-gray-700 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 rounded-sm",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center"
          )}
          disabled={props.disabled}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';