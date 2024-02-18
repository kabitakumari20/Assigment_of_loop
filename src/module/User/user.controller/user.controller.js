const{register,login,getUserByToken,
    }=require("../user.business/user.business");

const {fetchChatRooms,
    joinChatRoom,
    leaveChatRoom,
    createChatRoom,sendMessage,
    findAndChatInChatRoom}=require("../user.business/chatRoom")
    
exports.register=async(req)=>await register(req.body);
exports.login=async(req)=>await login(req.body);
exports.fetchChatRooms=async(req)=>await fetchChatRooms(req.user,req.body)
exports.joinChatRoom=async(req)=>await joinChatRoom(req.user,req.body)//,leaveChatRoom
exports.leaveChatRoom=async(req)=>await leaveChatRoom(req.user,req.body)//,
exports.createChatRoom=async(req)=>await createChatRoom(req.user,req.body)
exports.getUserByToken=async(req)=>await getUserByToken(req.user);
// exports.findAndChatInChatRoom=async(req)=>await findAndChatInChatRoom(req.user,req.body)
// exports.sendMessage = async (req) => await sendMessage(req.user, req.body, req.io);


