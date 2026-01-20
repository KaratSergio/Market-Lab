'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/core/schemas';
import { useLogin } from '@/core/hooks/useAuth';
import { Input, Button, PasswordInput } from '@/components/ui';
import { GoogleOAuthButton } from '../GoogleOAuthButton';
import { useTranslations, useLocale } from 'next-intl';

export function LoginForm() {
  const t = useTranslations();
  const locale = useLocale();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">{t('Auth.login')}</h2>
        <p className="mt-2 text-sm text-gray-600">
          {t('Auth.or')}{' '}
          <Link
            href={`/${locale}/register`}
            className="font-medium text-green-600 hover:text-green-500"
          >
            {t('Auth.registration')}
          </Link>
        </p>
      </div>

      {/* Google OAuth Button */}
      <div className="space-y-4">
        <GoogleOAuthButton />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">{t('Auth.or')} {t('Auth.continueWith')}</span>
          </div>
        </div>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t('Forms.email')}
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              {...register('email')}
              className="mt-1"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t('Forms.password')}
            </label>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder={t('Auth.createPassword')}
              {...register('password')}
              className="mt-1"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
        </div>

        {loginMutation.isError && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">
              {loginMutation.error.message}
            </p>
          </div>
        )}

        {/* Forgot password */}
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link
              href={`/${locale}/forgot-password`}
              className="font-medium text-green-600 hover:text-green-500"
            >
              {t('Auth.forgotPassword')}
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? t('Common.loading') : t('Auth.login')}
        </Button>
      </form>
    </div>
  );
}