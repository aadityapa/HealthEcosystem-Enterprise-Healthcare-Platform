export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-900/5 dark:from-background dark:via-background dark:to-primary-900/10">
      {children}
    </div>
  );
}
