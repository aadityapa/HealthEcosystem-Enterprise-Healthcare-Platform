'use client';

import { Handshake, Loader2, Mail, ShieldCheck } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await signIn(email, password);
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-8"
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
              <Handshake className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold">Partner Portal</h1>
            <p className="mt-1 text-sm text-muted-foreground">HealthEcosystem partner network</p>
          </div>

          <Card className="border-border/60 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Partner sign in</CardTitle>
              <CardDescription>Access subscriptions, quotations, and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" required>
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="partner@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" required>
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Sign in
                    </>
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button type="button" variant="outline" className="w-full" onClick={signInDemo}>
                Continue as demo partner
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
