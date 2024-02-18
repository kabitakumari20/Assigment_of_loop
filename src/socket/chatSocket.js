
const { Message, User, ChatRoom } = require("../module/User/user.model/user.model");
const mongoose = require("mongoose")
const onlineUsers = new Map();

module.exports = function socketFun(socket, io) {
    // socket.on('joinSocket', async (data, acknowledgement) => {

    //     console.log("customersocket----------", data)
    //     socket.roomId = data.roomId;
    //     try {
    //         if (data.roomId) {
    //             socket.join(data.roomId);
    //             if (!onlineUsers.has(data.roomId)) {
    //                 onlineUsers.set(data.roomId, []);
    //             }
    //             onlineUsers.get(data.roomId).push(data.senderId);
    //             io.to(data.roomId).emit('userJoined', data.senderId);
    //             io.to(data.roomId).emit('onlineUsers', onlineUsers.get(data.roomId));
    //             console.log("customer socket join", data.roomId);
    //         }
    //         acknowledgement(data);
    //     }
    //     catch (err) {
    //         console.log("erorororor---------", err)
    //         acknowledgement(data);
    //     }
    // });
    socket.on('joinSocket', async (data, acknowledgement) => {
        console.log("customersocket----------", data)
        socket.roomId = data.roomId;
        try {
            if (data.roomId) {
                socket.join(data.roomId);
                const chatRoom = await ChatRoom.findById(data.roomId);
                if (!chatRoom) {
                    throw new Error("Chat room not found");
                }
                // Update the onlineMembers field in the chat room
                // chatRoom.onlineMembers.push(data.senderId);
                chatRoom.onlineMembers.push({ user: data.senderId, status: true });
                await chatRoom.save();
                // Emit events to inform clients about the user join and updated online users list
                io.to(data.roomId).emit('userJoined', data.senderId);
                io.to(data.roomId).emit('onlineUsers', chatRoom.onlineMembers);
                console.log("customer socket join", data.roomId);
            }
            acknowledgement(data);
        } catch (err) {
            console.log("error: ", err.message);
            acknowledgement({ error: err.message });
        }
    });
    
    
    socket.on("sendMessage", async function (data, acknowledgement) {
        try {
            console.log("New Message---------", data);
            let findChatRoom = await ChatRoom.findOne({ _id: data.roomId });
            if (!findChatRoom && findChatRoom == null) throw "ChatRoom not found."
            if (!data.roomId || !data.senderId || !data.msg) {
                data.message = "Please fill all required field"
                acknowledgement(data);
            }
            // const result = await Message(data).save();
            console.log("data=======>>", data)

            // const senderObjectId = mongoose.Types.ObjectId(data.senderId);
            const senderObjectId = mongoose.Types.ObjectId.createFromHexString(data.senderId);
            console.log("senderObjectId=====>>", senderObjectId)
            let isExists = await ChatRoom.findOne({ _id: data.roomId, members: { $in: [senderObjectId] } });
            console.log("isExists=========>>>", isExists)
            if (!isExists) {
                throw ("you are not part of this chat room.");
            }
            let existingChat;
            existingChat = await Message.findOne({ roomId: data.roomId });
            console.log("existingChat=======>>", existingChat)
            var roomId = data.roomId
            if (!existingChat || existingChat == null) {
                existingChat = new Message({
                    roomId: data.roomId,

                });
                console.log("existingChat=====inside one==>>", existingChat)
                await existingChat.save()
                console.log("New chat message saved:", existingChat);
            }
            console.log("New chat message saved:", existingChat);

            const newMessage = {
                type: data.type,
                senderId: data.senderId,
                msg: data.msg,
                timestamp: new Date()
            };
            if (!existingChat.message) {
                existingChat.message = [];
            }
            existingChat.message.push(newMessage); // Fixed typo here

            await existingChat.save();



            io.to(data.roomId.toString()).emit("getMessage", { ...data, new_msg: true });

            acknowledgement(data);
        } catch (error) {
            console.log(error);
        }
    });
    socket.on("messagesList", async function (data, acknowledgement) {
        if (!data.roomId) throw "room id is require"
        existingChat = await Message.findOne({ roomId: data.roomId });
        console.log("existingChat========>>", existingChat)
        acknowledgement(existingChat)
    });

    // socket.on('userleftSocket', async (data, acknowledgement) => {
    //     console.log("customersocket----------", data)
    //     socket.roomId = data.roomId;
    //     try {
    //         if (data.roomId) {
    //             socket.join(data.roomId);
    //             console.log("customer exits from socket", data.roomId);
    //         }
    //         acknowledgement(data);
    //     }
    //     catch (err) {
    //         console.log("erorororor---------", err)
    //         acknowledgement(data);
    //     }
    // });


    socket.on('userleftSocket', async (data, acknowledgement) => {
        console.log("customersocket----------", data)
        socket.roomId = data.roomId;
        try {
            if (data.roomId) {
                const chatRoom = await ChatRoom.findById(data.roomId);
                if (!chatRoom) {
                    throw new Error("Chat room not found");
                }
                // Find the user's entry in the onlineMembers array
                const userIndex = chatRoom.onlineMembers.findIndex(member => member.user.equals(data.senderId));
                if (userIndex !== -1) {
                    // Update the status to false
                    chatRoom.onlineMembers[userIndex].status = false;
                    await chatRoom.save();
                    // Emit events to inform clients about the user leaving and updated online users list
                    io.to(data.roomId).emit('userleft', data.senderId);
                    io.to(data.roomId).emit('offlineUsers', chatRoom.onlineMembers);
                    console.log("customer socket left", data.roomId);
                }
            }
            acknowledgement(data);
        } catch (err) {
            console.log("error: ", err.message);
            acknowledgement({ error: err.message });
        }
    });
    
}