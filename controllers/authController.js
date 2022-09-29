const { initializeApp } = require("firebase/app");
const admin = require("firebase-admin");
const { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, sendSignInLinkToEmail } = require('firebase/auth')
// const serviceAccount = require("../config/serviceAccountKey.json");
const User = require("../models/User.js");
// const { response } = require("express");
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const axios = require('axios')

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
        .then(async (result) => {

            const data = {}
            data.email = result.email
            data.firebaseUUID = result.uid
            data.verification_code = Math.random().toString().substr(2, 6)
            const newUser = new User(data);

            try {
                const savedUser = await newUser.save();

                axios({
                    method: "POST",
                    url: "http://localhost:5000/send/email",
                    data: {
                        "email": req.body.email,
                        "subject": "Please verify your email address",
                        "text": data.verification_code
                    }
                })

                admin.auth()
                    .updateUser(result.uid, {
                        disabled: true,
                    })
                    .then(() => {
                        res.json({ message: "Your verification code has been successfully sent to your email. Please verify before login." })
                    })
                    .catch((err) => {
                        res.status(500).json({ message: err })
                    })

            } catch (error) {
                res.status(500).json({ message: error })
            }

        })
        .catch((error) => {
            console.log(error)
            res.json(error.message)
        })
}

const loginWithFirebase = async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCred) => {
            const user = {}
            const findUser = await User.findOne({ firebaseUUID: userCred.user.uid })

            if (findUser) {
                user._id = findUser._id
                user.full_name = findUser.full_name
                user.role = findUser.role
                user.phone_number = findUser.phone_number ?? ""
                user.profile_pict = findUser.profile_pict ?? ""

                res.json({ user: user, idToken: userCred._tokenResponse.idToken, refreshToken: userCred._tokenResponse.refreshToken });
            } else {
                const data = {}
                data.firebaseUUID = userCred.user.uid
                data.full_name = userCred._tokenResponse.displayName
                data.email = userCred._tokenResponse.email
                data.phone_number = userCred._tokenResponse.phoneNumber

                const newUser = new User(data);

                try {
                    const savedUser = await newUser.save();
                    const user = {}
                    const findUser = await User.findOne({ firebaseUUID: userCred.user.uid })

                    if (findUser) {
                        user._id = findUser._id
                        user.email = findUser.email
                        user.full_name = findUser.full_name
                        user.role = findUser.role
                        user.phone_number = findUser.phone_number ?? ""
                        user.profile_pict = findUser.profile_pict ?? ""
                    }

                    res.json({ user: user, idToken: userCred._tokenResponse.idToken, refreshToken: userCred._tokenResponse.refreshToken });

                } catch (error) {
                    res.status(500).json({ message: error.message });
                }
            }
        })
        .catch((err) => {
            res.status(401).json({ message: "Invalid credentials!" })
        })
}

const findOrCreateUser = async (userCred) => {
    const user = {}
    const findUser = await User.findOne({ firebaseUUID: userCred.user.uid })


    if (findUser) {
        user._id = findUser._id
        user.full_name = findUser.full_name
        user.role = findUser.role
        user.phone_number = findUser.phone_number ?? ""
        user.profile_pict = findUser.profile_pict ?? ""
    } else {
        const data = {}
        data.firebaseUUID = userCred.user.uid
        data.full_name = userCred._tokenResponse.displayName
        data.email = userCred._tokenResponse.email
        data.phone_number = userCred._tokenResponse.phoneNumber

        const newUser = new User(data);

        try {
            const savedUser = await newUser.save();
            const user = {}
            const findUser = await User.findOne({ firebaseUUID: userCred.user.uid })

            if (findUser) {
                user._id = findUser._id
                user.email = findUser.email
                user.full_name = findUser.full_name
                user.role = findUser.role
                user.phone_number = findUser.phone_number ?? ""
                user.profile_pict = findUser.profile_pict ?? ""
            }
            return ({ user: user, idToken: userCred._tokenResponse.idToken, refreshToken: userCred._tokenResponse.refreshToken });

        } catch (error) {
            return ({ message: error.message });
        }
    }
}

const verifyIdToken = (req, res) => {
    const token = req.headers.authorization ? req.headers.authorization.split(" ") : null
    if (!token) {
        res.json("You are not logged in!")
    } else {
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

const register = async (req, res) => {
    // if (req.body.full_name == "") {
    //     return res.status(400).json({ message: "Please enter your name!" })

    if (req.body.email == "") {
        return res.status(400).json({ message: "Email is required!" })
    } else if (req.body.password == "") {
        return res.status(400).json({ message: "Password is required!" })
    }
    // } else if (req.body.confirm_password == "") {
    //     return res.status(400).json({ message: "Please confirm the password!" })
    // } else if (req.body.password !== req.body.confirm_password) {
    //     return res.status(400).json({ message: 'The password are not match!' })
    // }

    try {

        ValidateEmail(req, res)
        const encryptedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = encryptedPassword

        const user = new User(req.body);

        const savedUser = await user.save();
        res.status(200).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const loginWithEmail = async (req, res) => {

    const findUser = await User.findOne({ email: req.body.email }).lean()

    if (!findUser) {
        return res.status(400).json("Wrong email or please register!")
    }

    try {
        if (await bcrypt.compare(req.body.password, findUser.password)) {

            const user = {}
            user._id = findUser._id
            user.full_name = findUser.full_name
            user.email = findUser.email
            user.role = findUser.role
            user.phone_number = findUser.phone_number ?? ""
            user.profile_pict = findUser.profile_pict ?? ""

            const accessToken = generateAccessToken(user)
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)

            return res.status(200).json({ user: user, idToken: accessToken, refreshToken: refreshToken })
        } else {
            return res.status(400).json({ message: "Invalid credentials!" })
        }
    } catch (error) {
        return res.status(400).json('Something wrong.')
    }

}

const verifyEmail = async (req, res) => {

    const { email, verification_code } = req.body
    const user = await User.findOne({ email: email })
    user.status = "Activated"

    if (verification_code == user.verification_code) {

        await User.updateOne({ _id: user._id }, { $set: user });

        admin.auth()
            .updateUser(user.firebaseUUID, {
                disabled: false,
            })
            .then(() => {
                res.json({ message: "Your acoount has been verified." })
            })
            .catch((err) => {
                res.status(500).json({ message: err })
            })
    } else {
        res.status(500).json({ message: "Something wrong." })
    }
}

const refreshToken = (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshToken.includes(refreshToken)) return res.sendStatus(403)
}

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
}

function ValidateEmail(req, res) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email)) {
        return (true)
    }
    res.status(400).json("You have entered an invalid email address!")
    return (false)
}


module.exports = { register, loginWithFirebase, registerWithFirebase, loginWithEmail, refreshToken, verifyEmail }