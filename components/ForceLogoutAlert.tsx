'use client';

import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertCircle } from 'lucide-react';

interface ForceLogoutAlertProps {
    open: boolean;
    onConfirm: () => void;
}

export function ForceLogoutAlert({ open, onConfirm }: ForceLogoutAlertProps) {
    return (
        <AlertDialog open={open}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-2 text-destructive mb-2">
                        <AlertCircle className="h-5 w-5" />
                        <AlertDialogTitle>Session Terminated</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-base">
                        Your session on this device has been terminated because you logged in from another device.
                        You&apos;ll be logged out automatically.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={onConfirm}>
                        Continue to Login
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
