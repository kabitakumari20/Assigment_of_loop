const WebSocket = require('ws');
const wss = new WebSocket.Server({ server: http });

wss.on('connection', function connection(ws) {
    // Handle WebSocket connections
    ws.on('message', function incoming(message) {
        // Broadcast the message to all clients
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});
