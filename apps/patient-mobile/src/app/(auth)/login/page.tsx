'use client';

import { Activity, ArrowLeft, Loader2, Phone, ShieldCheck } from 'lucide-react';
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
  const {
    sendOtp,
    confirmOtp,
    signInDemo,
    isLoading,
    error,
    otpSent,
    pendingPhone,
    clearError,
    resetOtpFlow,
  } = useAuth();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await sendOtp(phone);
    } catch {
      // Error handled in store
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await confirmOtp(pendingPhone ?? phone, otp);
    } catch {
      // Error handled in store
    }
  };

  const handleBack = () => {
    resetOtpFlow();
    setOtp('');
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
              <Activity className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold">HealthEcosystem</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your health, in your hands</p>
          </div>

          <Card className="border-border/60 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">
                {otpSent ? 'Enter OTP' : 'Sign in with phone'}
              </CardTitle>
              <CardDescription>
                {otpSent
                  ? `We sent a 6-digit code to ${pendingPhone ?? phone}`
                  : 'Enter your registered mobile number to continue'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" required>
                      Mobile number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="pl-10"
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp" required>
                      One-time password
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      className="text-center text-lg tracking-[0.5em]"
                      autoComplete="one-time-code"
                    />
                    <p className="text-xs text-muted-foreground">
                      Demo OTP: <span className="font-mono font-medium">123456</span>
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading || otp.length < 6}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Verify & Sign in
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Change number
                  </Button>
                </form>
              )}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button type="button" variant="outline" className="w-full" onClick={signInDemo}>
                Continue as demo patient
              </Button>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
}
