import { Injectable, inject } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';
import { UserNotificationFacade } from '../../features/notifications/facades/user-notification.facade';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private messaging: Messaging | null = null;
    private app: any;
    private toastService = inject(ToastService);
    private userNotificationFacade = inject(UserNotificationFacade);

    constructor() {
        this.initFirebase();
    }

    initFirebase() {
        this.app = initializeApp(environment.firebase);
        // You might want to wrap this in a try-catch or check browser support
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            try {
                this.messaging = getMessaging(this.app);

                // Listen for messages in the foreground
                onMessage(this.messaging, (payload) => {
                    console.log('Message received. ', payload);
                    // Handle the received message (e.g., show a toast or update UI)
                    if (payload.notification) {
                        const title = payload.notification.title || 'Notification';
                        const body = payload.notification.body || '';
                        this.toastService.show(`${title}: ${body}`, 'info');
                        // Refresh notifications list when a new one arrives
                        this.userNotificationFacade.loadMyNotifications();
                    }
                });

            } catch (e) {
                console.error('Firebase messaging initialization failed', e);
            }
        }
    }

    async requestPermission() {
        if (!this.messaging) return;

        // Check if browser supports notifications and what the current status is
        if (!('Notification' in window)) {
            console.log('This browser does not support desktop notification');
            return;
        }

        if (Notification.permission === 'denied') {
            console.info('Notification permission is blocked. Skipping token retrieval.');
            return;
        }

        try {
            const currentToken = await getToken(this.messaging, {
                vapidKey: (environment.firebase as any).vapidKey
            });

            if (currentToken) {
                console.log('FCM Token:', currentToken);
                // TODO: Send the token to your server
            } else {
                console.log('No registration token available. Request permission to generate one.');
            }
        } catch (err: any) {
            if (err.code === 'messaging/permission-blocked') {
                console.info('Notification permission was blocked by user.');
            } else {
                console.warn('An error occurred while retrieving token:', err);
            }
        }
    }
}
