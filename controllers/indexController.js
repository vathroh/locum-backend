const admin = require("firebase-admin");
const serviceAccount = require("../config/serviceAccountKey.json")
const { getAuth } = require('firebase/auth')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


const verifyIdToken = (req, res) => {
    const token = req.headers.authorization ? req.headers.authorization.split(" ") : null
    // console.log(token[1]);
    if (!token) {
        res.json("You are not logged in!")
    } else {
        admin.auth().verifyIdToken(token[1])
            // admin.auth().getUsers()
            .then((decodedToken) => {
                // const uid = decodedToken.uid;
                console.log(decodedToken);
                // ...
            })
            .catch((error) => {
                // Handle error
                res.json(error)
            });
        res.json('good')
    }

    res.json('halo')
}

module.exports = verifyIdToken;