const { initializeApp } = require("firebase/app");
const admin = require("firebase-admin");
const { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, sendSignInLinkToEmail } = require('firebase/auth')
const serviceAccount = require("../config/serviceAccountKey.json");
const User = require("../models/User.js");
const { response } = require("express");
const bcrypt = require('bcrypt');

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

const registerWithFirebase = async (req, res) => {
    const userResponse = await admin.auth().createUser({
        email: req.body.email,
        password: req.body.password,
        emailVerified: false,
        disabled: false
    })
        .then((result) => {
            console.log(result)
            res.json(result)
        })
        .catch((error) => {
            console.log(error)
            res.json(error.message)
        })
    res.json(userResponse)
}

const login = async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    await signInWithEmailAndPassword(auth, email, password)
        .then((userCred) => {
            res.json(userCred)
        })
        .catch((err) => {
            res.status(401).json({ message: "Invalid credentials!" })
        })
}

const register = async (req, res) => {
    if (req.body.full_name == "") {
        res.status(400).json({ message: "Please enter your name!" })
    } else if (req.body.email == "") {
        res.status(400).json({ message: "Email is required!" })
    } else if (req.body.password == "") {
        res.status(400).json({ message: "Password is required!" })
    } else if (req.body.confirm_password == "") {
        res.status(400).json({ message: "Please confirm the password!" })
    } else if (req.body.password !== req.body.confirm_password) {
        res.status(400).json({ message: 'The password are not match!' })
    }

    ValidateEmail(req, res)
    encryptedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = encryptedPassword

    const user = new User(req.body);

    try {
        const savedUser = await user.save();
        res.status(200).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

function ValidateEmail(req, res) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email)) {
        return (true)
    }
    res.status(400).json("You have entered an invalid email address!")
    return (false)
}


module.exports = { register, login, registerWithFirebase }