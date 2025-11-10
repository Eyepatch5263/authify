'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDeviceId } from '@/lib/device';

export function useSessionMonitor() {
    const router = useRouter();
    const [isForceLoggedOut, setIsForceLoggedOut] = useState(false);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        let timeoutId: NodeJS.Timeout;

        const checkSession = async () => {
            try {
                const deviceId = await getDeviceId();

                const response = await fetch('/api/sessions/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deviceId }),
                });

                const data = await response.json();

                // if forceLoggedOut is true, update state to trigger logout
                if (data.forceLoggedOut) {
                    setIsForceLoggedOut(true);
                    clearInterval(intervalId);
                }
            } catch (error) {
                console.error('Session verification error:', error);
            }
        };

        // Wait 2 seconds before first check to allow SessionGuard to create the session
        timeoutId = setTimeout(() => {
            checkSession();
            intervalId = setInterval(checkSession, 10000);
        }, 2000);

        // cleanup on unmount
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, []);

    const handleForceLogout = async () => {
        const deviceId = await getDeviceId();
        await fetch('/api/sessions/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId }),
        });
        router.push('/api/auth/logout');
    };

    return {
        isForceLoggedOut,
        handleForceLogout,
    };
}
