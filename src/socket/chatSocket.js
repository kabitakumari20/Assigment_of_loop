
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
    //             const chatRoom = await ChatRoom.findById(data.roomId);
    //             if (!chatRoom) {
    //                 throw new Error("Chat room not found");
    //             }
    //             // Update the onlineMembers field in the chat room
    //             // chatRoom.onlineMembers.push(data.senderId);
    //             chatRoom.onlineMembers.push({ user: data.senderId, status: true });
    //             await chatRoom.save();
    //             // Emit events to inform clients about the user join and updated online users list
    //             io.to(data.roomId).emit('userJoined', data.senderId);
    //             io.to(data.roomId).emit('onlineUsers', chatRoom.onlineMembers);
    //             console.log("customer socket join", data.roomId);
    //         }
    //         acknowledgement(data);
    //     } catch (err) {
    //         console.log("error: ", err.message);
    //         acknowledgement({ error: err.message });
    //     }
    // });

    socket.on('joinSocket', async (data, acknowledgement) => {
        console.log("customersocket----------", data);
        socket.roomId = data.roomId;
        try {
            if (data.roomId) {
                socket.join(data.roomId);
                const chatRoom = await ChatRoom.findById(data.roomId);
                if (!chatRoom) {
                    throw new Error("Chat room not found");
                }
                // Check if the user already exists in the onlineMembers array
                const userIndex = chatRoom.onlineMembers.findIndex(member => member.user.equals(data.senderId));
                if (userIndex === -1) {
                    // If user does not exist, add them to the onlineMembers array
                    chatRoom.onlineMembers.push({ user: data.senderId, status: true });
                } else {
                    // If user exists, update only the status to true
                    chatRoom.onlineMembers[userIndex].status = true;
                }
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


    socket.on('userleftSocket', async (data, acknowledgement) => {
        console.log("customersocket----------", data);
        socket.roomId = data.roomId;
        try {
            if (data.roomId) {
                const chatRoom = await ChatRoom.findById(data.roomId);
                if (!chatRoom) {
                    throw new Error("Chat room not found");
                }
     
                const userIndex = chatRoom.onlineMembers.findIndex(member => member.user.equals(data.senderId));
                if (userIndex !== -1) {
          
                    chatRoom.onlineMembers[userIndex].status = false;
                    await chatRoom.save();
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



    socket.on('onlineUsers', async (data, acknowledgement) => {
        try {
            const chatRoom = await ChatRoom.findOne({ _id: data.roomId, "onlineMembers.status": true });
            if (chatRoom) {
                io.to(data.roomId).emit('onlineUser', chatRoom.onlineMembers);
                acknowledgement(chatRoom)

            }
        } catch (error) {
            console.error(error);
            // Handle error appropriately
        }
    });


    socket.on('oflineUsers', async (data, acknowledgement) => {
        try {
            const chatRoom = await ChatRoom.findOne({ _id: data.roomId, "onlineMembers.status": false });
            if (chatRoom) {
                io.to(data.roomId).emit('oflineUsers', chatRoom.onlineMembers);
                acknowledgement(chatRoom)

            }
        } catch (error) {
            console.error(error);
        }
    });

  


}
