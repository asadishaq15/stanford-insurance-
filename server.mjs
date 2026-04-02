import http from 'http';
import https from 'https';

const API_USER = 't09jznl8';
const API_KEY = 'e242eeb980c36f7362a68386e8fe8a02';
const PORT = 3000;

const server = http.createServer((req, res) => {
    // 1. Define CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
        'Access-Control-Max-Age': 2592000, // 30 days
        'Content-Type': 'application/json'
    };

    // 2. Handle Pre-flight (OPTIONS)
    if (req.method === 'OPTIONS') {
        res.writeHead(204, headers);
        res.end();
        return;
    }

    // 3. Handle Actual POST
    if (req.method === 'POST' && req.url === '/api/lead') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const leadData = JSON.parse(body);
                
                // Add API Credentials
                leadData.api_user = API_USER;
                leadData.api_key = API_KEY;

                const params = new URLSearchParams(leadData);
                const postData = params.toString();

                const crmRequest = https.request({
                    hostname: 'api.crm.digitalseniorbenefits.com',
                    path: '/inbound-lead/',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': postData.length
                    }
                }, (crmResponse) => {
                    let responseBody = '';
                    crmResponse.on('data', (d) => { responseBody += d; });
                    crmResponse.on('end', () => {
                        console.log(`[${new Date().toLocaleTimeString()}] CRM: ${crmResponse.statusCode} - ${responseBody}`);
                        
                        // Send response back to browser with CORS headers
                        res.writeHead(crmResponse.statusCode, headers);
                        res.end(responseBody);
                    });
                });

                crmRequest.on('error', (e) => {
                    console.error('CRM Error:', e);
                    res.writeHead(500, headers);
                    res.end(JSON.stringify({ error: 'CRM Connection Failed' }));
                });

                crmRequest.write(postData);
                crmRequest.end();

            } catch (err) {
                res.writeHead(400, headers);
                res.end(JSON.stringify({ error: 'Invalid Lead Data' }));
            }
        });
    } else {
        res.writeHead(404, headers);
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

server.listen(PORT, () => {
    console.log(`\n🚀 Proxy server running at http://localhost:${PORT}`);
    console.log(`✅ Ready to accept leads from your website\n`);
});
