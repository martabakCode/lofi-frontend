module.exports = {
    "/api": {
        target: "https://lofiapi.martabakcode.my.id",
        secure: false,
        changeOrigin: true,
        logLevel: "debug",
        // Follow redirects automatically
        followRedirects: true,
        // Preserve the host header (some backends require this)
        preserveHeaderKeyCase: true,
        headers: {
            "Connection": "keep-alive"
        },
        onProxyReq: function(proxyReq, req, res) {
            // Spoof Origin and Referer headers to match the backend domain
            proxyReq.setHeader('Origin', 'https://lofiapi.martabakcode.my.id');
            proxyReq.setHeader('Referer', 'https://lofiapi.martabakcode.my.id/');
            
            // Log the outgoing request for debugging
            console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.path}`);
        },
        onProxyRes: function(proxyRes, req, res) {
            // Override CORS headers to allow localhost
            proxyRes.headers['access-control-allow-origin'] = req.headers.origin || '*';
            proxyRes.headers['access-control-allow-credentials'] = 'true';
            proxyRes.headers['access-control-allow-methods'] = 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS';
            proxyRes.headers['access-control-allow-headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
            
            console.log(`[Proxy Response] ${req.method} ${req.url} - Status: ${proxyRes.statusCode}`);
        },
        onError: function(err, req, res) {
            console.error('[Proxy Error]', err);
            res.writeHead(500, {
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
        }
    }
};
