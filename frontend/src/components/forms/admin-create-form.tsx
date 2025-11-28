'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateAdmin } from '@/core/hooks/use-admin.hooks';
import { ADMIN_ROLES } from '@/core/types/admin.types';
import { Button } from '../ui/button/button';
import { Input } from '../ui/input/input';
import { Select } from '../ui/select/select';
import { AdminCreateFormData, adminCreateSchema } from '@/core/utils/validations';


const ROLE_OPTIONS = [
  { value: ADMIN_ROLES.ADMIN, label: 'Administrator' },
  { value: ADMIN_ROLES.MODERATOR, label: 'Moderator' },
  { value: ADMIN_ROLES.SUPPORT, label: 'Support' },
];

export function AdminCreateForm() {
  const { mutate: createAdmin, isPending, isError, error } = useCreateAdmin();

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
        //! замінити на toast
        alert('Admin created successfully!');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <Input
          {...register('email')}
          type="email"
          placeholder="Email"
          error={errors.email?.message}
        />
      </div>

      <div>
        <Input
          {...register('password')}
          type="password"
          placeholder="Password"
          error={errors.password?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register('firstName')}
          placeholder="First Name"
          error={errors.firstName?.message}
        />
        <Input
          {...register('lastName')}
          placeholder="Last Name"
          error={errors.lastName?.message}
        />
      </div>

      <div>
        <Input
          {...register('phone')}
          placeholder="Phone"
          error={errors.phone?.message}
        />
      </div>

      <div>
        <Select
          {...register('role')}
          label="Admin Role"
          options={ROLE_OPTIONS}
          error={errors.role?.message}
        />
      </div>

      <div>
        <Input
          {...register('department')}
          placeholder="Department (optional)"
          error={errors.department?.message}
        />
      </div>

      {isError && (
        <div className="text-red-500 text-sm">
          {error?.message || 'Failed to create admin'}
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Creating...' : 'Create Admin'}
      </Button>
    </form>
  );
}