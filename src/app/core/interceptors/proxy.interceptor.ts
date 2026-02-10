import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const proxyInterceptor: HttpInterceptorFn = (req, next) => {
    const targetUrl = environment.apiUrl;

    // Safety check: ensure apiUrl is defined and absolute
    if (!targetUrl || !targetUrl.startsWith('http')) {
        return next(req);
    }

    try {
        const urlObj = new URL(targetUrl);
        const origin = urlObj.origin;

        if (req.url.startsWith(origin)) {
            // Rewrite to relative path to use proxy
            // This bypasses the Mixed Content error (HTTPS -> HTTP) by letting the
            // frontend server (Vercel/Angular Dev Server) handle the HTTP request.
            const relativeUrl = req.url.replace(origin, '');
            return next(req.clone({ url: relativeUrl }));
        }
    } catch (e) {
        console.warn('ProxyInterceptor: Invalid API URL', targetUrl);
    }

    return next(req);
};
