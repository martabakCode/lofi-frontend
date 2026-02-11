import { createProxyMiddleware } from 'http-proxy-middleware';

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};

const proxy = createProxyMiddleware({
    target: 'https://lofiapi.martabakcode.my.id',
    changeOrigin: true,
    secure: false,
    pathRewrite: {
        '^/api/proxy': '', // Remove /api/proxy prefix
    },
    on: {
        proxyReq: (proxyReq, req, res) => {
            // spoof origin to trick backend
            proxyReq.setHeader('Origin', 'https://lofiapi.martabakcode.my.id');
        },
        proxyRes: (proxyRes, req, res) => {
            // override CORS on response so browser allows it
            const reqOrigin = req.headers['origin'];
            if (reqOrigin) {
                proxyRes.headers['access-control-allow-origin'] = reqOrigin;
            } else {
                proxyRes.headers['access-control-allow-origin'] = '*';
            }
            proxyRes.headers['access-control-allow-credentials'] = 'true';
            proxyRes.headers['access-control-allow-methods'] = 'GET,OPTIONS,PATCH,DELETE,POST,PUT';
            proxyRes.headers['access-control-allow-headers'] = 'Authorization, Content-Type, X-Requested-With, Accept';
        }
    },
});

export default function (req, res) {
    return proxy(req, res, (result) => {
        if (result instanceof Error) {
            throw result;
        }
        throw new Error(`Request handler creation failed: ${result}`);
    });
}
