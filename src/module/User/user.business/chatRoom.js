const mongoose = require("mongoose");
const express = require("express")
const { User, ChatRoom, Message } = require("../../User/user.model/user.model");
const { secrectKey } = require("../../../../secretKey");
const CryptoJS = require("crypto-js");
const bcrypt = require("bcrypt");
const routes = express.Router();
const jwt = require("jsonwebtoken");
const { authenticate } = require("../../../middleware/authmiddleware");
const { addListener } = require("nodemon");
// Client-side WebSocket connection
const { socketFun } = require("../../../socket/chatSocket")
const WebSocket = require('ws');
const { Socket } = require("socket.io");
const Io = require("socket.io");
// const socket = new WebSocket('ws://your-server-url');//
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





const findAndChatInChatRoom1 = async (user, body) => {
    try {
        // require('./chatSocket')(socket);
        // await socketFun(body)
        let roomId = body.roomId;
        // console.log("roomId======>>", roomId);

        let existingChat = await Message.findOne({ roomId });
        // console.log("existingChat=======>>", existingChat);

        if (!existingChat) {
            existingChat = new Message({ roomId });
            // console.log("existingChat======>>", existingChat);
        }
        const newMessage = {
            type: body.type,
            senderId: user._id,
            content: body.message,
            timestamp: new Date()
        };

        if (!existingChat.messages) {
            existingChat.messages = [];
        }

        existingChat.message.push(newMessage);

        await existingChat.save();

        return {
            msg: "Ok",
            result: existingChat
        };
    } catch (error) {
        console.error("Error chatting in chat room:", error);
        throw { error: "Internal server error" };
    }
};



const findAndChatInChatRoom = async (user, body) => {
    try {
        console.log("user=========>>",user._id)
        const io = require('socket.io-client');
        const socket = io('http://localhost:5000');

        socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });
        let roomId = body.roomId;
        // let isExits = await ChatRoom.findOne({_id:roomId})
        let isExists = await ChatRoom.findOne({ _id: roomId, members: { $in: [user._id] } });
        if (!isExists) {
            throw("you are not part of this chat room.");
        }
        let existingChat = await Message.findOne({ roomId });

        if (!existingChat) {
            existingChat = new Message({ roomId });
        }
        const newMessage = {
            type: body.type,
            senderId: user._id,
            content: body.message,
            timestamp: new Date()
        };
        if (!existingChat.message) {
            existingChat.message = [];
        }
        existingChat.message.push(newMessage); // Fixed typo here

        await existingChat.save();

        // Emit message to the socket server
        socket.emit('chatMessage', newMessage);
        console.log('Message emitted to socket server:', newMessage);

        return {
            msg: "Ok",
            result: existingChat
        };
    } catch (error) {
        console.error("Error chatting in chat room:", error);
        throw { error: "Internal server error" };
    }
};



const sendMessage = async function (user, body, io) {
    let _id = user._id;
    console.log("_id===========>>", _id);

    const { conversation } = body;
    var socket = io.to(`user_${_id}`); // Assuming you have a unique identifier for each user, such as their user ID
    console.log("socket============>>", socket);

    let chatUser;
    chatUser = await ChatRoom.findOne({
        _id: body.roomId,
        $or: [{ members: _id }, { createdBy: _id }]
    }) || await ChatRoom.findOne({
        _id: conversation,
        $or: [{ participants: _id }, { createdBy: _id }]
    });

    if (!chatUser) {
        throw 'You are not part of this conversation';
    }

    console.log("chatUser==============>>", chatUser);

    // Emit the message to the specific user's socket
    socket.emit('sendMessage', body);

    return { "msg": "done" };
};

module.exports = {
    fetchChatRooms,
    createChatRoom,
    joinChatRoom,
    leaveChatRoom, sendMessage,
    findAndChatInChatRoom
}
