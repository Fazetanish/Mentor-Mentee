const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_Secret_User = process.env.JWT_Secret_User;

function authJWTMiddleware(req, res, next) {

    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(
            token.replace("Bearer ", ""),
            JWT_Secret_User
        );
        req.user = decoded;
        next();
    } catch (error) {
        console.error("JWT ERROR:", error.message);
        return res.status(401).json({ message: "Invalid token" });
    }
}


module.exports =({
    authJWTMiddleware : authJWTMiddleware
})