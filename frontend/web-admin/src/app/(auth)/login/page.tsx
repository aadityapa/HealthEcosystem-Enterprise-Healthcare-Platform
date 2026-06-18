'use client';

import { Activity, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@health/design-system';
import { useAuth } from '@/hooks/use-auth';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function LoginPage() {
  const { signIn, signInDemo, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await signIn(email, password);
    } catch {
      // Error handled in store
    }
  };

  const handleDemoLogin = () => {
    clearError();
    setEmail('admin@healthecosystem.in');
    setPassword('demo123');
    signInDemo();
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between bg-secondary-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Activity className="h-6 w-6" />
          </div>
          <span className="font-display text-xl font-bold">HealthEcosystem</span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="font-display text-4xl font-bold leading-tight">
            Enterprise Healthcare
            <br />
            <span className="text-primary-300">Administration Portal</span>
          </h2>
          <p className="max-w-md text-lg text-white/70">
            Manage patients, laboratory workflows, billing, and multi-branch operations from a
            unified dashboard built for clinical excellence.
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold text-primary-300">12K+</p>
              <p className="text-sm text-white/60">Active Patients</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-300">50+</p>
              <p className="text-sm text-white/60">Lab Branches</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-300">99.9%</p>
              <p className="text-sm text-white/60">Uptime SLA</p>
            </div>
          </div>
        </motion.div>
        <p className="text-sm text-white/40">© 2026 HealthEcosystem. HIPAA & NABL compliant.</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="absolute right-6 top-6">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">HealthEcosystem</span>
          </div>

          <Card className="border-border/60 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Sign in</CardTitle>
              <CardDescription>
                Enter your credentials to access the admin portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" required>
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@healthecosystem.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" required>
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>

                <Button type="button" variant="outline" className="w-full" onClick={handleDemoLogin}>
                  Continue with demo account
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
