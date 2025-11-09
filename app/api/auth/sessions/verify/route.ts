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
        const { deviceId } = body;
        // get user ID from session
        const userId = session.user.sub;

        const { data: deviceSession, error } = await supabase
            .from('device_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('device_id', deviceId)
            .eq('is_active', true)
            .maybeSingle();

        if (error) {
            console.error('Error verifying session:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        if (!deviceSession) {
            return NextResponse.json({
                valid: false,
                forceLoggedOut: true,
                message: 'This device has been logged out'
            });
        }

        const { error: updateError } = await supabase
            .from('device_sessions')
            .update({ last_activity: new Date().toISOString() })
            .eq('id', deviceSession.id);

        if (updateError) {
            console.error('Error updating last activity:', updateError);
        }

        return NextResponse.json({
            valid: true,
            sessionId: deviceSession.id
        });

    } catch (error) {
        console.error('Session verification error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
