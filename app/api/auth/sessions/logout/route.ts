import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/helpers/utils';

// This is logout: logs out the current device session

export async function POST(request: Request) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { deviceId } = body;
        const userId = session.user.sub;

        const { error } = await supabase
            .from('device_sessions')
            .update({ is_active: false })
            .eq('user_id', userId)
            .eq('device_id', deviceId);

        if (error) {
            console.error('Error logging out:', error);
            return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
