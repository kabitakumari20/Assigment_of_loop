const { User, ChatRoom, Message } = require("../../User/user.model/user.model");
const WebSocket = require('ws');
const { Socket } = require("socket.io");
const Io = require("socket.io");
const socket = new WebSocket('ws://localhost:5000');//localhost:5000
const createChatRoom = async (user, body) => {
    // try {
    console.log("body=====>>", body);
    body.createdBy = user._id;
    let newChat = new ChatRoom(body);
    if (!newChat) throw new Error("Chat room not created");
    let res = await newChat.save();
    return {
        msg: "Ok",
        result: res
    };
    // } catch (error) {
    //     console.error("Error creating chat room:", error);
    //     throw { error: "Internal server error" };
    // }
};


const fetchChatRooms = async (user) => {
    try {
        const chatRooms = await ChatRoom.find();
        if (chatRooms.length == 0) throw "chatRooms not found"
        return {
            msg: "Ok",
            count: chatRooms.length,
            result: chatRooms
        }
    } catch (error) {
        console.error('Error fetching chat rooms:', error);
        throw ({ error: 'Internal server error' });
    }
};



const getChatRoomsByUser = async (user) => {
    try {
        // Check if the provided userId exists in any chat room
        let userId = user._id
        const chatRooms = await ChatRoom.find({ members: { $in: [userId] } });

        if (chatRooms.length === 0) {
            return {
                msg: "User not found in any chat room",
                count: 0,
                result: []
            };
        }

        return {
            msg: "Ok",
            count: chatRooms.length,
            result: chatRooms
        };
    } catch (error) {
        console.error('Error fetching chat rooms:', error);
        throw ({ error: 'Internal server error' });
    }
};




const joinChatRoom = async (user, body) => {
    const { userId, roomId } = body;

    try {
        // Find the user and chat room
        const user = await User.findById(userId);
        const chatRoom = await ChatRoom.findById(roomId);

        // Check if both user and chat room exist
        if (!user || !chatRoom) {
            throw ({ error: 'User or chat room not found' });
        }

        // Add user to the chat room
        chatRoom.members.push(user._id);
        await chatRoom.save();

        return { message: 'User joined chat room successfully' }
    } catch (error) {
        console.error('Error joining chat room:', error);
        throw ({ error: 'Internal server error' });
    }
};


const leaveChatRoom = async (user, body) => {
    const { userId, roomId } = body;

    try {
        // Find the user and chat room
        const user = await User.findById(userId);
        const chatRoom = await ChatRoom.findById(roomId);

        // Check if both user and chat room exist
        if (!user || !chatRoom) {
            throw ({ error: 'User or chat room not found' });
        }

        // Remove user from the chat room
        chatRoom.members.pull(user._id);
        await chatRoom.save();

        // res.status(200).json({ message: 'User left chat room successfully' });
        return {
            message: 'User left chat room successfully'
        }
    } catch (error) {
        console.error('Error leaving chat room:', error);
        throw ({ error: 'Internal server error' });
    }
};



module.exports = {
    getChatRoomsByUser,
    fetchChatRooms,
    createChatRoom,
    joinChatRoom,
    leaveChatRoom,
}
