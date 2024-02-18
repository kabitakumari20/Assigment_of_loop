// const {socket}=require("../socket/")
module.exports = function (server, app) {
    console.log("socket called");
    var io = require('socket.io')(server);
    const redisAdapter = require('socket.io-redis');
    // io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));
    app.set('socketio', io);
    io.on('connection', function (socket) {
        console.log('socket connected', socket.id);
        require('./chatSocket')(socket,io);
        socket.on('disconnect', async function (reason) {
            console.log("Reason Disconnect type", socket.type, socket.userId);
            console.log("Reason Disconnect", reason);
        });
    });
}