const mongoose = require("mongoose");
const { User } = require("../module/User/user.model/user.model");
const { secrectKey } = require("../../secretKey");
const jwt = require("jsonwebtoken");
const authenticate = async (req, res, next) => {
    // try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            throw new Error("Invalid Authorization header");
        }
        const token = authHeader.substring("Bearer ".length);
        console.log("Token----------------->>", token);
        const decoded = jwt.verify(token, secrectKey);
        console.log("Decoded----------------->>", decoded);
        const userData = await User.findOne({ _id: decoded.id });
        console.log("UserData----------------->> ", userData);
        if (!userData) {
            throw new Error("User data not found");
        }
        req.user = userData;
        next();
    // } catch (error) {
    //     console.error("Authentication error: ", error);
    //     res.status(401).json({
    //         msg: "Unauthorized",
    //         error: error.message,
    //     });
    // }
};
function errorHandler(error, status) {
    return {
        error: status || 500,
        msg: "Internal server error",
    };
}
module.exports = {
    errorHandler,
    authenticate,
};
