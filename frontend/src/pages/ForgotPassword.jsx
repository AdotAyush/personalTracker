import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, ZapIcon, CheckCircleIcon } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authService } from '../services';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);

  const mutation = useMutation({
    mutationFn: (email) => authService.forgotPassword(email),
    onSuccess: () => setSent(true),
    onError: (err) => toast.error(err?.response?.data?.message || 'Something went wrong'),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 mb-4">
            <ZapIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
          <p className="text-zinc-500 mt-1">We'll email you a reset link</p>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircleIcon className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="text-white font-medium">Check your email</p>
              <p className="text-zinc-500 text-sm">
                We sent a reset link to <strong className="text-zinc-300">{email}</strong>.
                Check your inbox (and spam folder).
              </p>
              <Link to="/login" className="btn btn-secondary w-full justify-center">
                Back to Login
              </Link>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); mutation.mutate(email); }}
              className="space-y-4"
            >
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Sending...' : 'Send Reset Link'}
              </button>
              <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                <ArrowLeftIcon className="w-4 h-4" />
                Back to login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
