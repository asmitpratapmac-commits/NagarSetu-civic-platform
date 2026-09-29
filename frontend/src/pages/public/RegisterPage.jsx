import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerCitizen } from '../../redux/slices/authSlice';
import { Button } from '../../components/Button';

const schema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number')
    .optional()
    .or(z.literal('')),
  password: z.string().min(8, 'At least 8 characters'),
});

export const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector((s) => s.auth.status);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    const result = await dispatch(registerCitizen(values));
    if (registerCitizen.fulfilled.match(result)) {
      navigate('/citizen/dashboard', { replace: true });
    }
  };

  return (
    <div className="container-page flex min-h-[calc(100vh-64px)] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-medium text-char-950">Create your account</h1>
        <p className="mt-1.5 text-sm text-stone-600">Report civic issues and track them to resolution.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" placeholder="Jane Doe" {...registerField('name')} />
            {errors.name && <p className="mt-1 text-xs text-rust-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="you@example.com" {...registerField('email')} />
            {errors.email && <p className="mt-1 text-xs text-rust-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Phone (optional)</label>
            <input className="input" placeholder="9876543210" {...registerField('phone')} />
            {errors.phone && <p className="mt-1 text-xs text-rust-500">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="••••••••" {...registerField('password')} />
            {errors.password && <p className="mt-1 text-xs text-rust-500">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" isLoading={status === 'loading'}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-emerald-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};
