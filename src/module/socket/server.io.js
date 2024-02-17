const { Socket } = require("socket.io");
const Io = require("socket.io");
const { AuthSocket } = require("../../middleware/authSocket");
const { HandleSocketRequest } = require("./Controller/socketHandler");
const { getConvertationsByUserId } = require('../modules/chat/business/chat.business');
async function ConnectSocketServer(server) {
  console.log("socket server connected");

  const io = new Io.Server(server, {
    allowEIO3: true,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  io.use(async (socket, next) => {
    await AuthSocket(socket, next);
  });

  // setSocketServerInstance(io);

  const ChatIo = io.of("/");

  ChatIo.on("connection", (socket) => {
    console.log("connected user " + socket.id);
    joinAllChatRooms(socket);
    HandleSocketRequest(socket);
    socket.on("disconnect", () => {
      console.log("user disconnected " + socket.user.id);
    });
  });
}

async function joinAllChatRooms(socket) {
  const userId = socket.user.id;

  const socketId = socket.id;

  const rooms = await getConvertationsByUserId(userId);
  console.log({ rooms });

  rooms.forEach((room) => {
    console.log({ room, user: userId });
    socket.join(room);
  });
}

module.exports = {
  ConnectSocketServer
}