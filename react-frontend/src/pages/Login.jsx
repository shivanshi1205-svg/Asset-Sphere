import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

// Form validation schema using Zod
const loginSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  remember: z.boolean().optional(),
});

const Login = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    const result = await login(data.username, data.password);
    
    if (result.success) {
      success('Welcome back! Login successful.');
    } else {
      setApiError(result.error);
      toastError(result.error);
    }
    setLoading(false);
  };

  // Quick Demo Login Helper
  const handleQuickLogin = () => {
    setValue('username', 'demo');
    setValue('password', '87654321');
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-slate-50/50 p-4 md:p-0">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-premium md:h-[600px]">
        {/* Left Side: Brand Showcase */}
        <div className="relative hidden w-1/2 flex-col justify-between bg-slate-900 p-12 text-white md:flex">
          {/* Background Decorative Gradient */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.3),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.35),transparent_50%)]"></div>
          
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-2xl font-bold tracking-wide">
              Asset<span className="text-secondary font-medium">Space</span>
            </span>
          </div>

          <div className="relative z-10 mt-16 max-w-sm">
            <h2 className="font-display text-3xl font-bold leading-tight text-white lg:text-4xl">
              Manage all your IT assets in one place.
            </h2>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed">
              Track hardware lifecycle checkouts, allocate software license seats to team members, monitor consumable stock levels, and audit physical equipment on a single premium dashboard.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-6">
            <span>&copy; {new Date().getFullYear()} AssetSphere Platform</span>
            <span>Version 1.0.0</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-12 md:w-1/2">
          <div className="mx-auto w-full max-w-md">
            {/* Header */}
            <div className="mb-8 text-center md:text-left">
              <h1 className="font-display text-2xl font-bold text-slate-800 tracking-tight">
                Welcome back
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Please enter your credentials to login
              </p>
            </div>

            {/* API Error Notification */}
            {apiError && (
              <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-xs font-medium text-rose-600 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>{apiError}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Username"
                type="text"
                placeholder="Enter username"
                icon={Mail}
                error={errors.username?.message}
                {...register('username')}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  icon={Lock}
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-[34px] text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="h-4.5 w-4.5 rounded border-slate-300 text-primary focus:ring-primary/20"
                    {...register('remember')}
                  />
                  <span className="text-xs text-slate-500 font-medium">Remember me</span>
                </label>
                <span className="text-xs text-primary font-semibold hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                className="w-full mt-6 py-3 font-semibold text-sm"
                isLoading={loading}
              >
                Sign In
              </Button>
            </form>

            {/* Quick Demo Credentials Help */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold">Demo Account Shortcut</span>
                  <button
                    type="button"
                    onClick={handleQuickLogin}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Quick Autofill
                  </button>
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>Username: <strong className="text-slate-600">demo</strong></span>
                  <span>Password: <strong className="text-slate-600">87654321</strong></span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
