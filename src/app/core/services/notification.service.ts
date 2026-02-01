import { Injectable, inject } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private messaging: Messaging | null = null;
    private app: any;
    private toastService = inject(ToastService);

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
                    }
                });

            } catch (e) {
                console.error('Firebase messaging initialization failed', e);
            }
        }
    }

    async requestPermission() {
        if (!this.messaging) return;

        try {
            const currentToken = await getToken(this.messaging, {
                // vapidKey: 'YOUR_VAPID_KEY_HERE' 
            });

            if (currentToken) {
                console.log('FCM Token:', currentToken);
                // TODO: Send the token to your server
            } else {
                console.log('No registration token available. Request permission to generate one.');
            }
        } catch (err) {
            console.log('An error occurred while retrieving token. ', err);
        }
    }
}
