const jwt = require("jsonwebtoken");

const authJwtMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null)
        return res.status(401).json("You have log out, please login!");

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(401).json("Unauthorized!");
        delete user.iat;
        req.user = user;
        console.log(req.user);
        next();
    });
};

module.exports = { verifyIdToken, authFirebaseMiddleware, authJwtMiddleware };
