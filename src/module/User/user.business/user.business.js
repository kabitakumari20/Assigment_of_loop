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


// // Event listener for WebSocket connection established
// socket.addEventListener('open', function (event) {
//     console.log('WebSocket connection established');
// });

// // // Event listener for WebSocket messages
// socket.addEventListener('message', function (event) {
//     console.log('Message from server:', event.data);
//     // Update UI with the received message
//     updateChatUI(event.data);
// });

// // // Function to send a message to the server
// function sendMessage(message) {
//     socket.send(JSON.stringify(message));
// }

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

const getUserByToken = async (user) => {
    let userId = user._id
    let findUser = await User.findById(userId)
    if (!findUser) throw "User not found";
    return {
        msg: "OK",
        result: findUser
    }
}







module.exports = {
    register, login, getUserByToken
}