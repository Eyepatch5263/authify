'use client';
// Device selection modal to allow user to select which device to log out when maximum device limit is reached
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Laptop, Smartphone, Monitor, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DeviceSession {
    id: string;
    deviceName: string;
    lastActivity: string;
    createdAt: string;
}

interface DeviceSelectionModalProps {
    open: boolean;
    sessions: DeviceSession[];
    onCancel: () => void;
    onConfirm: (sessionId: string) => void;
}

export function DeviceSelectionModal({ open, sessions, onCancel, onConfirm }: DeviceSelectionModalProps) {
    const [selectedSession, setSelectedSession] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        if (!selectedSession) return;
        setIsLoading(true);
        await onConfirm(selectedSession);
        setIsLoading(false);
    };

    // Dynamically get device icon based on device name
    const getDeviceIcon = (deviceName: string) => {
        if (deviceName.toLowerCase().includes('android') || deviceName.toLowerCase().includes('ios')) {
            return <Smartphone className="h-5 w-5" />;
        }
        if (deviceName.toLowerCase().includes('windows') || deviceName.toLowerCase().includes('mac')) {
            return <Laptop className="h-5 w-5" />;
        }
        return <Monitor className="h-5 w-5" />;
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Device Limit Reached</DialogTitle>
                    <DialogDescription>
                        You&apos;ve reached the maximum of 3 concurrent devices. Please select a device to log out and continue with this device.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <RadioGroup value={selectedSession} onValueChange={setSelectedSession}>
                        <div className="space-y-3">
                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors ${selectedSession === session.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    <RadioGroupItem value={session.id} id={session.id} className="mt-1" />
                                    <Label htmlFor={session.id} className="flex-1 cursor-pointer">
                                        <div className="flex items-center gap-2 mb-1">
                                            {getDeviceIcon(session.deviceName)}
                                            <span className="font-medium">{session.deviceName}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span>Last active {formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true })}</span>
                                        </div>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </RadioGroup>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={!selectedSession || isLoading}>
                        {isLoading ? 'Logging out...' : 'Log out selected device'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
