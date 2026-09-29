import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { userApi } from '../../api';
import { authApi } from '../../api/authApi';
import { fetchCurrentUser, logout } from '../../redux/slices/authSlice';
import { Button } from '../../components/Button';
import { useNavigate } from 'react-router-dom';

export const ProfilePage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone, address: user?.address },
  });
  const passwordForm = useForm();

  const onSaveProfile = async (values) => {
    setSavingProfile(true);
    try {
      await userApi.updateProfile(values);
      await dispatch(fetchCurrentUser());
      toast.success('Profile updated.');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (values) => {
    setSavingPassword(true);
    try {
      await authApi.changePassword(values);
      toast.success('Password changed. Please log in again.');
      await dispatch(logout());
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-medium text-char-950">Profile</h1>
        <p className="mt-1 text-sm text-stone-600">
          {user?.email} · <span className="capitalize">{user?.role}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSaveProfile)} className="card space-y-4 p-6">
        <h2 className="font-medium text-char-950">Personal details</h2>
        <div>
          <label className="label">Full name</label>
          <input className="input" {...register('name')} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" {...register('phone')} />
        </div>
        <div>
          <label className="label">Address</label>
          <input className="input" {...register('address')} />
        </div>
        <Button type="submit" isLoading={savingProfile}>
          Save changes
        </Button>
      </form>

      <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="card space-y-4 p-6">
        <h2 className="font-medium text-char-950">Change password</h2>
        <div>
          <label className="label">Current password</label>
          <input type="password" className="input" {...passwordForm.register('currentPassword')} />
        </div>
        <div>
          <label className="label">New password</label>
          <input type="password" className="input" {...passwordForm.register('newPassword')} />
        </div>
        <Button type="submit" variant="outline" isLoading={savingPassword}>
          Update password
        </Button>
      </form>
    </div>
  );
};
