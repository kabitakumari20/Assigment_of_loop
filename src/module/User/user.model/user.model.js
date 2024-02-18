const mongoose = require("mongoose");
const { secretKey } = require("../../../../secretKey");
const jwt = require("jsonwebtoken")
const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: String

},
    {
        timestamps: true,
        versionKey: false
    });



UserSchema.statics.findByToken = function (token, res) {
    var user = this;
    var decoded;
    try {

        decoded = jwt.verify(token, secretKey)
        // console.log("secret----------", secret)
        // console.log("decoded--------", decoded)
    } catch (e) {
        throw e.message || "Unauthorised request";
    }
    return User.findOne({
        _id: decoded._id,
    })
        .then((user) => {
            if (!user) {
                return Promise.reject({ message: msg.unauthorisedRequest });
            } else {
                return Promise.resolve(user);
            }
        })
        .catch((e) => {
            throw msg.unauthorisedRequest;
        });
};


const messagesSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['text', 'image'],
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
    },
    isOnline: {
        type: Boolean,

        default: false
    },
    msg: String,
    imageUrl: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const messageSchema = new mongoose.Schema({

    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChatRoom"

    },
    message: [messagesSchema],
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const chatRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    members: [],
    onlineMembers: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            status: {
                type: Boolean,
                default: false
            }
        }
    ]

}, {
    timestamps: true,
    versionKey: false,
});


const ChatRoom = new mongoose.model("ChatRoom", chatRoomSchema);
// module.exports = { User }
const Message = new mongoose.model("Message", messageSchema)
const User = new mongoose.model("User", UserSchema);
module.exports = { User, ChatRoom, Message }