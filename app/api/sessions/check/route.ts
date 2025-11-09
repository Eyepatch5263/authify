import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/utils';


const MAX_DEVICES = parseInt(process.env.MAX_CONCURRENT_DEVICES || '3');

export async function POST(request: Request) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { deviceId, deviceName, userAgent } = body;
        const userId = session.user.sub;

        // First, upsert the current device session (creates or updates)
        const { data: currentSession, error: upsertError } = await supabase
            .from('device_sessions')
            .upsert(
                {
                    user_id: userId,
                    device_id: deviceId,
                    device_name: deviceName,
                    user_agent: userAgent,
                    last_activity: new Date().toISOString(),
                    is_active: true,
                },
                {
                    onConflict: 'user_id,device_id',
                }
            )
            .select()
            .single();

        if (upsertError) {
            console.error('Error creating/updating session:', upsertError);
            return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
        }

        // Now check total active sessions for this user
        const { data: activeSessions, error: fetchError } = await supabase
            .from('device_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);

        if (fetchError) {
            console.error('Error fetching sessions:', fetchError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // If we have too many devices, check if the current device is already in the list
        if (activeSessions && activeSessions.length > MAX_DEVICES) {
            // The current device is already counted, so we need to force logout of another device
            const otherSessions = activeSessions.filter(s => s.device_id !== deviceId);

            return NextResponse.json({
                allowed: false,
                needsDeviceSelection: true,
                activeSessions: otherSessions.map(s => ({
                    id: s.id,
                    deviceName: s.device_name,
                    lastActivity: s.last_activity,
                    createdAt: s.created_at,
                })),
                message: `Maximum ${MAX_DEVICES} devices allowed. Please select a device to log out.`
            });
        }

        return NextResponse.json({
            allowed: true,
            sessionId: currentSession.id,
            message: 'Session verified'
        });

    } catch (error) {
        console.error('Session check error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
