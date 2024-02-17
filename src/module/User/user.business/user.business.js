const mongoose = require("mongoose");
const express = require("express")
const { User, Chat } = require("../../User/user.model/user.model");
const { secrectKey } = require("../../../../secretKey");
const CryptoJS = require("crypto-js");
const bcrypt = require("bcrypt");
const routes = express.Router();
const jwt = require("jsonwebtoken");
const { authenticate } = require("../../../middleware/authmiddleware");
const { addListener } = require("nodemon");
// Client-side WebSocket connection
const WebSocket = require('ws');
const { Socket } = require("socket.io");
const Io = require("socket.io");
// const socket = new WebSocket('ws://your-server-url');//
const socket = new WebSocket('ws://localhost:5000');//localhost:5000


// // Event listener for WebSocket connection established
socket.addEventListener('open', function (event) {
    console.log('WebSocket connection established');
});

// // Event listener for WebSocket messages
socket.addEventListener('message', function (event) {
    console.log('Message from server:', event.data);
    // Update UI with the received message
    updateChatUI(event.data);
});

// // Function to send a message to the server
function sendMessage(message) {
    socket.send(JSON.stringify(message));
}

// Example usage:
// sendMessage({ chatId: '123', content: 'Hello, world!' });


// For generating jwt auth token
var generateAuthToken = user => {
    return new Promise((resolve, reject) => {
        let token = jwt.sign({ _id: user._id.toString() }, secrectKey)//.toString();
        resolve(token);
    });
};




const register = async (body) => {
    try {
        const existingUser = await User.findOne({ email: body.email });
        console.log("existingUser------------->>", existingUser);
        if (existingUser) throw "email allready register";

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(body.password, saltRounds);
        body.password = hashedPassword;

        const data = new User(body);
        const res = await data.save();

        return {
            msg: "register data sucessfully",
            result: res
        };
    } catch (error) {
        console.log("error----------------->>", error);
    }
}


const login = async (body) => {
    try {
        const existingUser = await User.findOne({ email: body.email });
        console.log("existingUser------------>>", existingUser);
        if (!existingUser) throw "invalited email find";

        const isPasswordMath = await bcrypt.compare(body.password, existingUser.password);
        console.log("isPasswordMath----------->>>", isPasswordMath);
        if (!isPasswordMath) throw "invalited password find";

        const token = jwt.sign({ id: existingUser._id.toString() }, secrectKey);

        return {
            msg: "login sucess",
            user: existingUser,
            token
        };
    } catch (error) {
        console.log("error--------------->>", error);
    }
}

const getUserByToken=async(user)=>{
    let userId=user._id
    let findUser=await User.findById(userId)
    if(!findUser) throw "User not found";
    return{
        msg:"OK",
        result:findUser
    }
}


const fetchChatRooms = async (user) => {
    try {
        const chatRooms = await Chat.find();  
        if(chatRooms.length==0) throw "chatRooms not found"   
        return {
            msg: "Ok",
            count:chatRooms.length,
            result: chatRooms
        }
    } catch (error) {
        console.error('Error fetching chat rooms:', error);
        throw ({ error: 'Internal server error' });
    }
};


const createChatRoom = async (user, body) => {
    // try {
        console.log("body=====>>", body);
        body.createdBy = user._id;
        let newChat = new Chat(body);
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


const joinChatRoom = async (user, body) => {
    const { userId, roomId } = body;

    try {
        // Find the user and chat room
        const user = await User.findById(userId);
        const chatRoom = await Chat.findById(roomId);

        // Check if both user and chat room exist
        if (!user || !chatRoom) {
            throw ({ error: 'User or chat room not found' });
        }

        // Add user to the chat room
        chatRoom.members.push(user._id);
        await chatRoom.save();

        return{ message: 'User joined chat room successfully' }
    } catch (error) {
        console.error('Error joining chat room:', error);
        throw({ error: 'Internal server error' });
    }
};


const leaveChatRoom = async (user, body) => {
    const { userId, roomId } = body;

    try {
        // Find the user and chat room
        const user = await User.findById(userId);
        const chatRoom = await Chat.findById(roomId);

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



const findAndChatInChatRoom = async (user, body) => {
    try {
        console.log("user=====>>", user);

        // Get the chat room based on the provided chatId
        let chatRoom = await Chat.findById(body.chatId);
        if (!chatRoom) {
            throw new Error("Chat room not found");
        }

        const messageContent = body.content;
        const newMessage = {
            type: body.type, 
            senderId: user._id,
            content: body.message,
            timestamp: new Date()
        }
        chatRoom.messages.push(newMessage);
        let result = await chatRoom.save();

        return {
            msg: "Ok",
            result: result
        };
    } catch (error) {
        console.error("Error chatting in chat room:", error);
        throw { error: "Internal server error" };
    }
};




module.exports = {
    register, login,getUserByToken,
    fetchChatRooms,
    createChatRoom,
    joinChatRoom,
    leaveChatRoom,
    findAndChatInChatRoom
}