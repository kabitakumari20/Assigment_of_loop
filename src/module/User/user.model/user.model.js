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


const messageSchema = new mongoose.Schema({
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
    content: String, // For text messages
    imageUrl: String, // For image messages
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
    members:[],
    messages: [messageSchema]
    // Add other properties as needed
}, {
    timestamps: true,
    versionKey: false,
});


const Chat = new mongoose.model("Chat", chatRoomSchema);
// module.exports = { User }
const User = new mongoose.model("User", UserSchema);
module.exports = { User, Chat }