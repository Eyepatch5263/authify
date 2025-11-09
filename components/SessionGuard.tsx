'use client';
// This is responsible for checking if the user session is valid, if not redirect to logout by showing DeviceSelectionModal
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDeviceId, getDeviceName } from '@/lib/device';
import { Loader2 } from 'lucide-react';
import { DeviceSelectionModal } from './DeviceSelectionModal';

interface SessionGuardProps {
    children: React.ReactNode;
}

export function SessionGuard({ children }: SessionGuardProps) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [showDeviceModal, setShowDeviceModal] = useState(false);
    // no of sessions currently active
    const [activeSessions, setActiveSessions] = useState<any[]>([]);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            // get device ID and name
            const deviceId = await getDeviceId();
            const deviceName = getDeviceName();
            const userAgent = navigator.userAgent;

            const response = await fetch('/api/sessions/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId, deviceName, userAgent }),
            });

            const data = await response.json();

            // means maximum devices reached and device selection is needed
            if (data.needsDeviceSelection) {
                setActiveSessions(data.activeSessions);
                // device selection option should be displayed since maximum devices limit reached
                setShowDeviceModal(true);
                setIsChecking(false);
            } else if (data.allowed) {
                setIsChecking(false);
            } else {
                router.push('/api/auth/logout');
            }
        } catch (error) {
            console.error('Session check error:', error);
            setIsChecking(false);
        }
    };

    const handleForceLogout = async (sessionIdToLogout: string) => {
        try {
            const deviceId = await getDeviceId();
            const deviceName = getDeviceName();
            const userAgent = navigator.userAgent;

            const response = await fetch('/api/sessions/force-logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionIdToLogout,
                    newDeviceId: deviceId,
                    deviceName,
                    userAgent,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setShowDeviceModal(false);
                setIsChecking(false);
            }
        } catch (error) {
            console.error('Force logout error:', error);
        }
    };

    // logout route
    const handleCancel = () => {
        router.push('/api/auth/logout');
    };

    // if isChecking is true display a loader
    if (isChecking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Verifying session...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {children}
            <DeviceSelectionModal
                open={showDeviceModal}
                sessions={activeSessions}
                onCancel={handleCancel}
                onConfirm={handleForceLogout}
            />
        </>
    );
}