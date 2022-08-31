const http = require("http"),
    https = require("https");

http.createServer(function (req, res) {
    const origin = req.headers["proxy_wgu_origin"];
    if (!origin) {
        res.writeHead("200", {
            "Content-Type": "text/plain",
        });
        res.end("hello");
        return;
    }

    const newUrl = new URL(origin);
    delete req.headers["proxy_wgu_origin"];
    req.headers.host = newUrl.host;
    const proxyReq = (newUrl.protocol === "https" ? https : http).request(newUrl.toString(), {
        method: req.method,
        headers: req.headers,
    }, proxyRes => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });
    req.pipe(proxyReq);
    proxyReq.on("error", error => {
        res.end();
    });
}).listen(process.env.port || 3000);


