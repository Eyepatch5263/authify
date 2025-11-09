import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpPromise: Promise<any> | null = null;

// generates a unique device identifier using FingerprintJS
export async function getDeviceId(): Promise<string> {
    if (!fpPromise) {
        fpPromise = FingerprintJS.load();
    }

    const fp = await fpPromise;
    const result = await fp.get();
    return result.visitorId;
}

// generates a human-readable device name based on the user agent
export function getDeviceName(): string {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
    } else if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browser = 'Chrome';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browser = 'Safari';
    } else if (userAgent.includes('Edg')) {
        browser = 'Edge';
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
        browser = 'Opera';
    }
    // determine OS

    if (userAgent.includes('Windows')) {
        os = 'Windows';
    } else if (userAgent.includes('Mac')) {
        os = 'macOS';
    } else if (userAgent.includes('Linux')) {
        os = 'Linux';
    } else if (userAgent.includes('Android')) {
        os = 'Android';
    } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        os = 'iOS';
    }

    return `${browser} on ${os}`;
}
