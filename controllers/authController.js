const { initializeApp } = require("firebase/app");
const admin = require("firebase-admin");
const { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, sendSignInLinkToEmail } = require('firebase/auth')
const serviceAccount = require("../config/serviceAccountKey.json")

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });


const firebaseConfig = {
    apiKey: "AIzaSyAJMrnCOVifTBjIj4xv5rsxnDMQsgXzBS4",
    authDomain: "locumsg-82094.firebaseapp.com",
    projectId: "locumsg-82094",
    storageBucket: "locumsg-82094.appspot.com",
    messagingSenderId: "868654243090",
    appId: "1:868654243090:web:4dbde59e391fb6d82a67cb",
    measurementId: "G-BMJF0EBZ33"
};

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
auth.languageCode = 'it';

const register = async (req, res) => {
    const userResponse = await admin.auth().createUser({
        email: req.body.email,
        password: req.body.password,
        emailVerified: false,
        disabled: false
    })
        .then((result) => {
            console.log(result)
        })
        .catch((error) => {
            console.log(error)
        })
    res.json(userResponse)
}

const login = async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    await signInWithEmailAndPassword(auth, email, password)
        .then((userCred) => {
            res.json(userCred.user)
        })
        .catch((err) => {
            res.status(err.code).json(err.message)
        })
}


module.exports = { register, login }