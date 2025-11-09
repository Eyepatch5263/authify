import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/helpers/utils';

// checks the number of active device sessions for the user
// if the number exceeds the limit, prompts the user to select a device to log out
// if under the limit, creates a new device session
// Maximum allowed concurrent devices per user
const MAX_DEVICES = parseInt(process.env.MAX_CONCURRENT_DEVICES || '3');

export async function POST(request: Request) {
    try {

        // fetch user session
        const session = await getSession();

        // if no session, return unauthorized
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { deviceId, deviceName, userAgent } = body;
        // get user ID from session
        const userId = session.user.sub;

        const { data: activeSessions, error: fetchError } = await supabase
            .from('device_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);

        // handle database fetch error
        if (fetchError) {
            console.error('Error fetching sessions:', fetchError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // check if device is already registered by finding device_id in activeSessions
        const existingSession = activeSessions?.find(s => s.device_id === deviceId);

        // if session exists, update last_activity and return allowed
        // if updateError occurs, log it but still return allowed
        if (existingSession) {
            const { error: updateError } = await supabase
                .from('device_sessions')
                .update({ last_activity: new Date().toISOString() })
                .eq('id', existingSession.id);

            if (updateError) {
                console.error('Error updating session:', updateError);
            }

            return NextResponse.json({
                allowed: true,
                sessionId: existingSession.id,
                message: 'Session updated'
            });
        }

        // if active sessions exceed max devices, prompt for device selection
        if (activeSessions && activeSessions.length >= MAX_DEVICES) {
            return NextResponse.json({
                allowed: false,
                needsDeviceSelection: true,
                activeSessions: activeSessions.map(s => ({
                    id: s.id,
                    deviceName: s.device_name,
                    lastActivity: s.last_activity,
                    createdAt: s.created_at,
                })),
                message: `Maximum ${MAX_DEVICES} devices allowed. Please select a device to log out.`
            });
        }

        // create new session for the device
        const { data: newSession, error: insertError } = await supabase
            .from('device_sessions')
            .insert({
                user_id: userId,
                device_id: deviceId,
                device_name: deviceName,
                user_agent: userAgent,
                last_activity: new Date().toISOString(),
                is_active: true,
            })
            .select()
            .single();

        // handle insertion error
        if (insertError) {
            console.error('Error creating session:', insertError);
            return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
        }

        // return success response with new session ID
        return NextResponse.json({
            allowed: true,
            sessionId: newSession.id,
            message: 'New session created'
        });

        // if any error occurs, return internal server error
    } catch (error) {
        console.error('Session check error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
