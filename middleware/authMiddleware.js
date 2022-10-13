const admin = require("firebase-admin");
const serviceAccount = require("../config/serviceAccountKey.json")
const { getAuth } = require('firebase/auth')
const User = require("../models/User.js");
const jwt = require('jsonwebtoken')
const axios = require('axios');
const { post } = require("../routes/clinicRoutes");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

//https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=[API_KEY]

const verifyIdToken = (req, res) => {
    const token = req.headers.authorization ? req.headers.authorization.split(" ") : null
    if (!token) {
        res.json("You are not logged in!")
    } else {
        // console.log(token[1]);
        admin.auth().verifyIdToken(token[1])
            .then((decodedToken) => {
                // const uid = decodedToken.uid;
                console.log(decodedToken);
                // console.log(uid)
                // ...
                res.json('good1')
            })
            .catch((error) => {
                // Handle error
                res.json(error)
            });
    }

}

const authFirebaseMiddleware = (req, res, next) => {
    const token = req.headers.authorization ? req.headers.authorization.split(" ") : null
    if (!token) {
        res.json("You are not logged in!")
    } else {
        admin.auth().verifyIdToken(token[1])
            .then(async (decodedToken) => {
                const findUser = await User.findOne({ firebaseUUID: decodedToken.user_id })
                const user = {}
                user._id = findUser._id
                user.full_name = findUser.full_name
                user.role = findUser.role
                user.phone_number = findUser.phone_number ?? ""
                user.profile_pict = findUser.profile_pict ?? ""
                req.user = user
                next()
            })
            .catch(async (error) => {
                res.status(401).json("The Token has been expired. Please relogin.")
            });

    }

}

const authJwtMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.status(401).json('You have log out, please login!')

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json('Unauthorized!')
        req.user = user
        next()
    })
}

module.exports = { verifyIdToken, authFirebaseMiddleware, authJwtMiddleware };