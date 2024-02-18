const User = require('../models/userTable');
const Order = require('../models/ordersTable');
const message = require('../models/messageTable')
const io = require('socket.io-emitter')({ host: '127.0.0.1', port: 6379 });
const Push = require('../helper/pushNotification')


module.exports = function (socket) {
    socket.on("sendMessage", async function (data, acknowledgement) {
        try {
            console.log("sendMessage-------", data)
            let keys = null
            data.date_created_utc = new Date();
            if (!data.sender || !data.receiver || !data.msg) {
                data.message = "Please fill all required field"
                acknowledgement(data);
            }
            const result = await message(data).save();
            let receiverData = await User.findById(data.receiver).populate('store')
            if (receiverData.store.firebase) {
                keys = receiverData.store.firebase;
            }
            if (result) {
                let getMsg = await message.findById(result._id)
                    .populate(
                        {
                            path: 'sender',
                            select: 'name profileImage',
                            populate: {
                                path: 'profileImage',
                                select: "link"
                            }
                        }
                    )
                    .populate(
                        {
                            path: 'receiver',
                            select: 'name profileImage',
                            populate: {
                                path: 'profileImage',
                                select: "link"
                            }
                        }
                    )
                io.to(data.receiver.toString()).emit("getMessage", getMsg);
                console.log("receiverData-------", receiverData)
                if (receiverData && !receiverData.isJoined) {
                    if (receiverData && receiverData.firebaseTokens && keys != null) {
                        let title = "New Message"
                        let fcmData = {
                            orderId: data.orderId,
                            type: "newMessage"
                        }
                        Push.sendPushToAll(receiverData.firebaseTokens, title, data.msg, fcmData, keys);
                    }
                }
                acknowledgement(getMsg)
            }
        } catch (error) {
            console.log(error);
        }
    });
    socket.on("messagesList", async function (data, acknowledgement) {
        if (!data.sender || !data.receiver) {
            data.message = "Please fill all required field......."
            acknowledgement(data);
        }
        let qry1 = {
            sender: data.sender,
            receiver: data.receiver,
        }
        let qry2 = {
            sender: data.receiver,
            receiver: data.sender,
        }
        if (data.orderId) {
            qry1.orderId = data.orderId
            qry2.orderId = data.orderId
        }
        const result = await message.find({
            $or: [qry1, qry2]
        }).populate(
            {
                path: 'sender',
                select: 'name profileImage',
                populate: {
                    path: 'profileImage',
                    select: "link"
                }
            }
        )
            .populate(
                {
                    path: 'receiver',
                    select: 'name profileImage',
                    populate: {
                        path: 'profileImage',
                        select: "link"
                    }
                }
            ).lean();
        await message.updateMany({
            isRead: false,
            $or: [
                {
                    sender: data.sender,
                    receiver: data.receiver
                },
                {
                    sender: data.receiver,
                    receiver: data.sender
                },
            ]
        }, { $set: { isRead: true } })
        acknowledgement(result)
    });
}


module.exports = function socket(socket) {
    socket.on("sendMessage", async function (data, acknowledgement) {
        try {
            console.log("sendMessage-------", data)
            let keys = null
            data.date_created_utc = new Date();
            if (!data.sender || !data.receiver || !data.msg) {
                data.message = "Please fill all required field"
                acknowledgement(data);
            }
            const result = await message(data).save();
            let receiverData = await User.findById(data.receiver).populate('store')
            if (receiverData.store.firebase) {
                keys = receiverData.store.firebase;
            }
            if (result) {
                let getMsg = await message.findById(result._id)
                    .populate(
                        {
                            path: 'sender',
                            select: 'name profileImage',
                            populate: {
                                path: 'profileImage',
                                select: "link"
                            }
                        }
                    )
                    .populate(
                        {
                            path: 'receiver',
                            select: 'name profileImage',
                            populate: {
                                path: 'profileImage',
                                select: "link"
                            }
                        }
                    )
                io.to(data.receiver.toString()).emit("getMessage", getMsg);
                console.log("receiverData-------", receiverData)
                if (receiverData && !receiverData.isJoined) {
                    if (receiverData && receiverData.firebaseTokens && keys != null) {
                        let title = "New Message"
                        let fcmData = {
                            orderId: data.orderId,
                            type: "newMessage"
                        }
                        Push.sendPushToAll(receiverData.firebaseTokens, title, data.msg, fcmData, keys);
                    }
                }
                acknowledgement(getMsg)
            }
        } catch (error) {
            console.log(error);
        }
    });
    socket.on("messagesList", async function (data, acknowledgement) {
        if (!data.sender || !data.receiver) {
            data.message = "Please fill all required field......."
            acknowledgement(data);
        }
        let qry1 = {
            sender: data.sender,
            receiver: data.receiver,
        }
        let qry2 = {
            sender: data.receiver,
            receiver: data.sender,
        }
        if (data.orderId) {
            qry1.orderId = data.orderId
            qry2.orderId = data.orderId
        }
        const result = await message.find({
            $or: [qry1, qry2]
        }).populate(
            {
                path: 'sender',
                select: 'name profileImage',
                populate: {
                    path: 'profileImage',
                    select: "link"
                }
            }
        )
            .populate(
                {
                    path: 'receiver',
                    select: 'name profileImage',
                    populate: {
                        path: 'profileImage',
                        select: "link"
                    }
                }
            ).lean();
        await message.updateMany({
            isRead: false,
            $or: [
                {
                    sender: data.sender,
                    receiver: data.receiver
                },
                {
                    sender: data.receiver,
                    receiver: data.sender
                },
            ]
        }, { $set: { isRead: true } })
        acknowledgement(result)
    });
}