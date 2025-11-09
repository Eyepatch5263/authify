import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/helpers/utils';


export async function POST(request: Request) {
    try {
        // fetch user session
        const session = await getSession();

        // if no session, return unauthorized
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { sessionIdToLogout, newDeviceId, deviceName, userAgent } = body;
        // get user ID from session
        const userId = session.user.sub;

        // log out the selected device session
        const { error: logoutError } = await supabase
            .from('device_sessions')
            .update({ is_active: false })
            .eq('id', sessionIdToLogout)
            .eq('user_id', userId);

        // handle logout error
        if (logoutError) {
            console.error('Error logging out device:', logoutError);
            return NextResponse.json({ error: 'Failed to logout device' }, { status: 500 });
        }

        // create a new session for the current device
        const { data: newSession, error: insertError } = await supabase
            .from('device_sessions')
            .insert({
                user_id: userId,
                device_id: newDeviceId,
                device_name: deviceName,
                user_agent: userAgent,
                last_activity: new Date().toISOString(),
                is_active: true,
            })
            .select()
            .single();
        
        // handle insertion error

        if (insertError) {
            console.error('Error creating new session:', insertError);
            return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
        }
        // return success response with new session ID

        return NextResponse.json({
            success: true,
            sessionId: newSession.id,
            message: 'Device logged out and new session created'
        });

        // if any error occurs, return internal server error
    } catch (error) {
        console.error('Force logout error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
