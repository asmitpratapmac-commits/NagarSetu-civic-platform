import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import { Button } from '../../components/Button';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useSelector((s) => s.auth.status);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    const result = await dispatch(login(values));
    if (login.fulfilled.match(result)) {
      const role = result.payload.user.role;
      const redirectTo = location.state?.from?.pathname || `/${role}/dashboard`;
      navigate(redirectTo, { replace: true });
    }
  };

  return (
    <div className="container-page flex min-h-[calc(100vh-64px)] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-medium text-char-950">Welcome back</h1>
        <p className="mt-1.5 text-sm text-stone-600">Log in to track and manage civic complaints.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-rust-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="••••••••" {...register('password')} />
            {errors.password && <p className="mt-1 text-xs text-rust-500">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" isLoading={status === 'loading'}>
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-600">
          New to NagarSetu?{' '}
          <Link to="/register" className="font-medium text-emerald-600 hover:underline">
            Create a citizen account
          </Link>
        </p>
      </div>
    </div>
  );
};
