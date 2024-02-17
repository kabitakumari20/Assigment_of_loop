const user=require("./src/module/User/user.routes/user.route")
// const chat=require("./src/module/chat/routes/chat.routes")

module.exports=[
    {
    path:"/api/user",
    handler:user
}
]