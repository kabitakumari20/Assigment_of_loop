
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const router = express.Router(); // Unused router instance
const mongoose = require("./src/db/db");
const { Socket } = require("socket.io");
const io = require("socket.io");
const http = require("http");
const server = http.createServer(app);

const port = 5000;
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server }); // Pass 'server' here instead of 'http'
const publicDirectoryPath = path.join(__dirname, "/public");
const route = require("./routes");

app.use(express.static(publicDirectoryPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/Stripe/webhook', bodyParser.raw({ type: "*/*" }));

route.map((route) => {
  app.use(route.path, route.handler);
});

app.get("/", async function (req, res) {
  res.status(200).send("Welcome to my page");
});




// io.on('connection', (socket) => {
//     console.log('A user connected');
//     socket.on('disconnect', () => {
//       console.log('A user disconnected');
//     });
//   });




// wss.on('connection', function connection(ws) {
//     console.log('Client connected');
    
//     ws.on('message', function incoming(message) {
//         console.log("message=====", message);
//         try {
//             const parsedMessage = JSON.parse(message);
//             switch (parsedMessage.type) {
//                 case 'text':
//                     handleTextMessage(parsedMessage);
//                     break;
//                 case 'image':
//                     handleImageMessage(parsedMessage);
//                     break;
//                 default:
//                     console.log('Unknown message type:', parsedMessage.type);
//             }
//         } catch (error) {
//             console.error('Error parsing message:', error);
//         }
//     });
// });


// function handleTextMessage(message) {
//     // Assuming you have access to the WebSocket server instance wss
//     // Broadcast the text message to all connected clients
//     const broadcastMessage = JSON.stringify({
//         type: 'text',
//         content: message.content,
//         senderId: message.senderId,
//         timestamp: new Date()
//     });
//     wss.clients.forEach(function each(client) {
//         if (client.readyState === WebSocket.OPEN) {
//             client.send(broadcastMessage);
//         }
//     });
// }

// function handleImageMessage(message) {
//     // Assuming you have access to the WebSocket server instance wss
//     // Broadcast the image message to all connected clients
//     const broadcastMessage = JSON.stringify({
//         type: 'image',
//         imageUrl: message.imageUrl,
//         senderId: message.senderId,
//         timestamp: new Date()
//     });
//     wss.clients.forEach(function each(client) {
//         if (client.readyState === WebSocket.OPEN) {
//             client.send(broadcastMessage);
//         }
//     });
// }


// Socket.IO logic





server.listen(port, () => {
    console.log(`Server started at ${port}`);
});


require('./src/socket/socket')(server, app)




