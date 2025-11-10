'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SessionGuard } from '@/components/SessionGuard';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, User, Phone, Mail, LogOut, Smartphone, Activity } from 'lucide-react';
import { getDeviceId } from '@/lib/device';
import { supabase } from '@/lib/utils';
import { ForceLogoutAlert } from '@/components/ForceLogoutAlert';

export default function Dashboard() {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const { isForceLoggedOut, handleForceLogout } = useSessionMonitor();
    const [activeSessions, setActiveSessions] = useState<any[]>([]);
    const [currentDeviceId, setCurrentDeviceId] = useState<string>('');

    // 
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (user) {
            loadActiveSessions();

            // Set up real-time subscription for device_sessions changes
            const channel = supabase
                .channel('device_sessions_changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
                        schema: 'public',
                        table: 'device_sessions',
                        filter: `user_id=eq.${user.sub}`
                    },
                    (payload) => {
                        console.log('Session change detected:', payload);
                        // Reload sessions when any change occurs
                        loadActiveSessions();
                    }
                )
                .subscribe();

            // Cleanup subscription on unmount
            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    const loadActiveSessions = async () => {
        try {
            const deviceId = await getDeviceId();
            setCurrentDeviceId(deviceId);

            const { data, error } = await supabase
                .from('device_sessions')
                .select('*')
                .eq('user_id', user?.sub)
                .eq('is_active', true)
                .order('last_activity', { ascending: false });

            if (!error && data) {
                setActiveSessions(data);
            }
        } catch (error) {
            console.error('Error loading sessions:', error);
        }
    };

    const handleLogout = async () => {
        const deviceId = await getDeviceId();
        await fetch('/api/sessions/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId }),
        });
        router.push('/api/auth/logout');
    };

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

    if (!user) {
        return null;
    }

    const initials = user.name
        ?.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase() || 'U';

    return (
        <SessionGuard>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
                <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center gap-2">
                                <Shield className="h-8 w-8 text-primary" />
                                <span className="text-xl font-bold">SecureAuth</span>
                            </div>
                            <Button variant="ghost" onClick={handleLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name?.split(' ')[0] || 'User'}!</h1>
                        <p className="text-muted-foreground">Manage your profile and active device sessions</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Profile Information
                                    </CardTitle>
                                    <CardDescription>Your personal account details</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center gap-6">
                                        <Avatar className="h-20 w-20">
                                            <AvatarImage src={user.picture || undefined} alt={user.name || 'User'} />
                                            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-semibold mb-1">{user.name || 'User'}</h3>
                                            <Badge variant="secondary" className="gap-1">
                                                <Shield className="h-3 w-3" />
                                                Verified Account
                                            </Badge>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="h-4 w-4" />
                                                <span>Email Address</span>
                                            </div>
                                            <p className="font-medium">{user.email || 'Not provided'}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                <span>Phone Number</span>
                                            </div>
                                            <p className="font-medium">{(user as any).phone_number || (user as any).user_metadata?.phone || 'Not provided'}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex gap-3">
                                            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-blue-900 mb-1">Account Security</p>
                                                <p className="text-sm text-blue-700">
                                                    Your account is protected with Auth0 security. You can manage up to 3 concurrent device sessions.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Smartphone className="h-5 w-5" />
                                        Active Sessions
                                    </CardTitle>
                                    <CardDescription>Currently logged in devices ({activeSessions.length}/3)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {activeSessions.map((session) => {
                                            const isCurrentDevice = session.device_id === currentDeviceId;
                                            return (
                                                <div
                                                    key={session.id}
                                                    className={`p-3 rounded-lg border ${isCurrentDevice ? 'border-primary bg-primary/5' : 'border-border'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Smartphone className="h-4 w-4" />
                                                            <span className="font-medium text-sm">{session.device_name}</span>
                                                        </div>
                                                        {isCurrentDevice && (
                                                            <Badge variant="default" className="text-xs">Current</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Activity className="h-3 w-3" />
                                                        <span>Active</span>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {activeSessions.length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                No active sessions found
                                            </p>
                                        )}
                                    </div>

                                    {activeSessions.length > 0 && (
                                        <div className="mt-4 p-3 bg-muted rounded-lg">
                                            <p className="text-xs text-muted-foreground">
                                                When you reach the 3-device limit, you&apos;ll be prompted to select which device to log out.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Active Devices</span>
                                        <span className="font-bold text-lg">{activeSessions.length}/3</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Account Status</span>
                                        <Badge variant="default" className="gap-1">
                                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                            Active
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>

                <ForceLogoutAlert open={isForceLoggedOut} onConfirm={handleForceLogout} />
            </div>
        </SessionGuard>
    );
}
