import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  CheckCircle2, 
  Sparkles,
  Layers
} from 'lucide-react';
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

  // 3D Motion Values
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for 3D tilt
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-12, 12]);
  
  // Spotlight position
  const spotlightX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%']);
  const spotlightY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const {
    register,
    handleSubmit,
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

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 perspective-1000 selection:bg-cyan-500 selection:text-white">
      {/* 3D Animated Background Grid & Particles */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      {/* Ambient Animated Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [-20, 20, -20],
          y: [-20, 20, -20]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/5 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px] pointer-events-none"
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.25, 0.45, 0.25],
          x: [20, -20, 20],
          y: [20, -20, 20]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 right-1/5 h-96 w-96 rounded-full bg-teal-500/20 blur-[130px] pointer-events-none"
      />
      
      {/* Floating 3D Micro Objects */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-12 right-16 hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md shadow-2xl text-cyan-400 text-xs font-semibold z-10"
      >
        <Zap className="h-4 w-4 text-cyan-400 animate-pulse" />
        <span>Real-time Asset Telemetry</span>
      </motion.div>

      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -8, 8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-12 left-16 hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md shadow-2xl text-emerald-400 text-xs font-semibold z-10"
      >
        <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
        <span>256-bit Encrypted Vault</span>
      </motion.div>

      {/* Main 3D Card Container */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl rounded-3xl border border-slate-800/80 bg-slate-900/70 p-1.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-shadow duration-500 hover:shadow-[0_35px_80px_-20px_rgba(14,165,233,0.15)]"
      >
        {/* Interactive Inner Spotlight Effect */}
        <motion.div 
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at ${spotlightX} ${spotlightY}, rgba(56, 189, 248, 0.15), transparent 40%)`
          }}
        />

        <div 
          style={{ transformStyle: 'preserve-3d' }}
          className="flex w-full flex-col overflow-hidden rounded-[22px] bg-slate-950/60 md:flex-row md:h-[620px]"
        >
          {/* Left Side: 3D Brand Showcase */}
          <div 
            style={{ transformStyle: 'preserve-3d' }}
            className="relative hidden w-1/2 flex-col justify-between p-12 text-white md:flex overflow-hidden border-r border-slate-800/60"
          >
            {/* Ambient Interior Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-slate-950 to-teal-950/30 opacity-90"></div>
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl"></div>

            {/* Header Brand Badge (3D Elevate Z=40) */}
            <div 
              style={{ transform: 'translateZ(40px)' }}
              className="relative z-10 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/30">
                  <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950">
                    <Building2 className="h-5.5 w-5.5 text-cyan-400" />
                  </div>
                </div>
                <span className="font-display text-2xl font-bold tracking-wide text-white">
                  Asset <span className="text-cyan-400 font-semibold">Sphere</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-semibold text-cyan-400">
                <Sparkles className="h-3 w-3 animate-spin" style={{ animationDuration: '4s' }} />
                <span>v2.0 3D Engine</span>
              </div>
            </div>

            {/* Core Value Proposition (3D Elevate Z=50) */}
            <div 
              style={{ transform: 'translateZ(50px)' }}
              className="relative z-10 my-auto py-8"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-medium mb-6">
                <Cpu className="h-3.5 w-3.5 text-blue-400" />
                <span>Enterprise Asset Governance</span>
              </div>

              <h2 className="font-display text-3xl font-extrabold leading-tight text-white lg:text-4xl tracking-tight">
                Intelligent control for modern IT infrastructure.
              </h2>
              <p className="text-slate-400 text-sm mt-4 leading-relaxed font-normal">
                Seamlessly track physical hardware lifecycles, assign software license seats, monitor consumable stock levels, and audit department allocations from one unified dashboard.
              </p>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-2 gap-3 mt-8">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xs">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                  <span className="text-xs text-slate-300 font-medium">Auto-Sync DB</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xs">
                  <Layers className="h-4 w-4 text-teal-400 flex-shrink-0" />
                  <span className="text-xs text-slate-300 font-medium">Multi-tenant Ready</span>
                </div>
              </div>
            </div>

            {/* Footer Copyright (3D Elevate Z=30) */}
            <div 
              style={{ transform: 'translateZ(30px)' }}
              className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-6"
            >
              <span>&copy; {new Date().getFullYear()} Asset Sphere Inc.</span>
              <span className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                System Operational
              </span>
            </div>
          </div>

          {/* Right Side: Glassmorphic 3D Form */}
          <div 
            style={{ transformStyle: 'preserve-3d' }}
            className="flex w-full flex-col justify-center px-6 py-10 sm:px-12 md:w-1/2 bg-slate-950/40 relative z-10"
          >
            <div 
              style={{ transform: 'translateZ(35px)' }}
              className="mx-auto w-full max-w-md"
            >
              {/* Form Header */}
              <div className="mb-8 text-center md:text-left">
                <h1 className="font-display text-2xl font-bold text-white tracking-tight sm:text-3xl">
                  Sign in to Portal
                </h1>
                <p className="text-slate-400 text-sm mt-1.5">
                  Enter your credentials to access your organization dashboard
                </p>
              </div>

              {/* API Error Notification */}
              {apiError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-300 backdrop-blur-md"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-400" />
                  <div>{apiError}</div>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter username"
                      className={`w-full rounded-xl bg-slate-900/90 border px-3.5 py-3 pl-10 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 ${
                        errors.username ? 'border-rose-500/50' : 'border-slate-800'
                      }`}
                      {...register('username')}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-rose-400 mt-1.5">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      className={`w-full rounded-xl bg-slate-900/90 border px-3.5 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 ${
                        errors.password ? 'border-rose-500/50' : 'border-slate-800'
                      }`}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-rose-400 mt-1.5">{errors.password.message}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/20"
                      {...register('remember')}
                    />
                    <span className="text-xs text-slate-400 font-medium">Remember me</span>
                  </label>
                  <span className="text-xs text-cyan-400 font-semibold hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>

                {/* Submit Button */}
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full mt-4 py-3.5 font-semibold text-sm bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl shadow-lg shadow-cyan-500/25 border-0 transition-all duration-300"
                    isLoading={loading}
                  >
                    Authenticate & Continue
                  </Button>
                </motion.div>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

