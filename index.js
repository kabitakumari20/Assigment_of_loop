
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

route.map((route) => {
  app.use(route.path, route.handler);
});

app.get("/", async function (req, res) {
  res.status(200).send("Welcome to my page");
});



server.listen(port, () => {
    console.log(`Server started at ${port}`);
});


require('./src/socket/socket')(server, app)





