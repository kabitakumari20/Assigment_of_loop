const express=require("express");
const router=express.Router()

const{authenticate}=require("../../../middleware/authmiddleware");
const {register,login,getUserByToken,fetchChatRooms,
    joinChatRoom,leaveChatRoom,findAndChatInChatRoom,
    createChatRoom}=require("../user.controller/user.controller");
const { wrapAsync } = require("../../../helper/router.helper");

router.post("/register",wrapAsync(register));
router.post("/login",wrapAsync(login));
router.get("/getUserByToken",authenticate,wrapAsync(getUserByToken))
router.get("/fetchChatRooms",authenticate,wrapAsync(fetchChatRooms))//
router.post("/joinChatRoom",authenticate,wrapAsync(joinChatRoom))
router.post("/leaveChatRoom",authenticate,wrapAsync(leaveChatRoom))
router.post("/createChatRoom",authenticate,wrapAsync(createChatRoom))
router.post("/findAndChatInChatRoom",authenticate,wrapAsync(findAndChatInChatRoom))


module.exports=router