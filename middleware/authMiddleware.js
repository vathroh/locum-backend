const admin = require("firebase-admin");
const serviceAccount = require("../config/serviceAccountKey.json")
const { getAuth } = require('firebase/auth')

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

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization ? req.headers.authorization.split(" ") : null
    if (!token) {
        res.json("You are not logged in!")
    } else {
        admin.auth().verifyIdToken(token[1])
            .then((decodedToken) => {
                next()
            })
            .catch((error) => {
                res.status(401).json("The Token has been expired. Please login.")
            });

    }

}

module.exports = { verifyIdToken, authMiddleware };