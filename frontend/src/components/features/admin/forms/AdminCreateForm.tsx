'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateAdmin } from '@/core/hooks/useAdmin';
import { ADMIN_ROLES } from '@/core/types/adminTypes';
import { Button, Input, Select } from '@/components/ui';
import { AdminCreateFormData, adminCreateSchema } from '@/core/schemas';
import { useTranslations } from 'next-intl';

const ROLE_OPTIONS = [
  { value: ADMIN_ROLES.ADMIN, label: 'Administrator' },
  { value: ADMIN_ROLES.MODERATOR, label: 'Moderator' },
  { value: ADMIN_ROLES.SUPPORT, label: 'Support' },
];

export function AdminCreateForm() {
  const { mutate: createAdmin, isPending, isError, error } = useCreateAdmin();
  const t = useTranslations('AdminCreateForm');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AdminCreateFormData>({
    resolver: zodResolver(adminCreateSchema),
  });

  const onSubmit = (data: AdminCreateFormData) => {
    createAdmin(data, {
      onSuccess: () => {
        reset();
        alert(t('successMessage'));
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <Input
          {...register('email')}
          type="email"
          placeholder={t('emailPlaceholder')}
          error={errors.email?.message}
        />
      </div>

      <div>
        <Input
          {...register('password')}
          type="password"
          placeholder={t('passwordPlaceholder')}
          error={errors.password?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register('firstName')}
          placeholder={t('firstNamePlaceholder')}
          error={errors.firstName?.message}
        />
        <Input
          {...register('lastName')}
          placeholder={t('lastNamePlaceholder')}
          error={errors.lastName?.message}
        />
      </div>

      <div>
        <Input
          {...register('phone')}
          placeholder={t('phonePlaceholder')}
          error={errors.phone?.message}
        />
      </div>

      <div>
        <Select
          {...register('role')}
          label={t('roleLabel')}
          options={ROLE_OPTIONS}
          error={errors.role?.message}
        />
      </div>

      <div>
        <Input
          {...register('department')}
          placeholder={t('departmentPlaceholder')}
          error={errors.department?.message}
        />
      </div>

      {isError && (
        <div className="text-red-500 text-sm">
          {error?.message || t('errorMessage')}
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? t('creatingButton') : t('createButton')}
      </Button>
    </form>
  );
}