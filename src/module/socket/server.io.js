const { Socket } = require("socket.io");
const Io = require("socket.io");
const { AuthSocket } = require("../../middleware/authSocket");

Io.on('connection', socket => {
    console.log('A user connected');
  
    // Joining a room
    socket.on('join', room => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });
  
    // Sending a message to a room
    socket.on('message', async ({ room, user, text }) => {
      const message = new Message({ user, text });
      await message.save();
      Io.to(room).emit('message', message);
    });
  
    // Leaving a room
    socket.on('leave', room => {
      socket.leave(room);
      console.log(`User left room: ${room}`);
    });
  
    // Disconnect
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });