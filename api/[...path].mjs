import { createProxyMiddleware } from 'http-proxy-middleware';

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};

const proxy = createProxyMiddleware({
    target: 'https://lofiapi.martabakcode.my.id/',
    changeOrigin: true,
    on: {
        proxyReq: (proxyReq, req, res) => {
            // 1. Overwrite Origin to match the backend IP, tricking the backend's CORS check
            proxyReq.setHeader('Origin', 'https://lofiapi.martabakcode.my.id');
        },
        proxyRes: (proxyRes, req, res) => {
            // 2. Overwrite Access-Control-Allow-Origin to match the browser's origin (or *), fixing the browser's CORS check
            // We set it to the updated origin or a wildcard because the backend might return the spoofed origin (http://34.51.203.228)
            const reqOrigin = req.headers['origin'];
            if (reqOrigin) {
                proxyRes.headers['access-control-allow-origin'] = reqOrigin;
            } else {
                proxyRes.headers['access-control-allow-origin'] = '*';
            }

            // Ensure credentials are allowed if needed
            proxyRes.headers['access-control-allow-credentials'] = 'true';

            // Pass other CORS headers if missing? Usually keeping what backend sends is fine, 
            // but we might need to permit headers used by the app.
            // proxyRes.headers['access-control-allow-methods'] = 'GET,POST,PUT,DELETE,OPTIONS';
            // proxyRes.headers['access-control-allow-headers'] = 'Content-Type,Authorization,...';
        }
    },
});

export default function (req, res) {
    // Vercel/Node adapter for the middleware
    return proxy(req, res, (result) => {
        if (result instanceof Error) {
            throw result;
        }
        // If the proxy calls next(), it means it didn't handle the request?
        // In strict proxy mode, this usually doesn't happen unless configured to filter.
        throw new Error(`Proxy middleware returned without handling request: ${result}`);
    });
}
