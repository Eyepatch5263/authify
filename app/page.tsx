'use client';
// landing page
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Smartphone, Lock, CheckCircle } from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Authify</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <a href="/api/auth/login">Sign In</a>
              </Button>
              <Button asChild>
                <a href="/api/auth/signup">Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Secure Multi-Device
                <br />
                Session Management
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Take control of your account security with intelligent device session management.
                Stay protected across all your devices.
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" asChild>
                  <a href="/api/auth/signup">Start Free Trial</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="/api/auth/login">Sign In</a>
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-20">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Device Limit Control</CardTitle>
                  <CardDescription>
                    Limit concurrent active sessions to 3 devices maximum, ensuring your account
                    remains secure and under your control.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Smart Device Detection</CardTitle>
                  <CardDescription>
                    Automatically identify and track devices with detailed information including
                    browser type, operating system, and last activity.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Graceful Logout</CardTitle>
                  <CardDescription>
                    When logging in from a new device, choose which existing device to log out,
                    with instant notifications on affected devices.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <Card className="max-w-4xl mx-auto border-2 bg-gradient-to-br from-slate-50 to-white">
              <CardContent className="pt-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">How It Works</h3>
                    <ul className="space-y-4">
                      <li className="flex gap-3">
                        <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Sign up or sign in</p>
                          <p className="text-sm text-muted-foreground">Create your secure account with Auth0</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Access your dashboard</p>
                          <p className="text-sm text-muted-foreground">View your profile and manage devices</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Stay in control</p>
                          <p className="text-sm text-muted-foreground">Monitor and manage up to 3 concurrent sessions</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-lg border">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium">Device 1: Active</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium">Device 2: Active</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium">Device 3: Active</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <Lock className="h-5 w-5 text-amber-600" />
                        <span className="text-sm font-medium">Maximum reached</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white/80 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Authfiy. Built with Auth0 and Next.js.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
