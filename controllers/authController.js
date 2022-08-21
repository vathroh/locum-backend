const { initializeApp } = require("firebase/app");
const admin = require("firebase-admin");
const { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, getRedirectResult } = require('firebase/auth')
const serviceAccount = require("../config/serviceAccountKey.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


const firebaseConfig = {
    apiKey: "AIzaSyB82LtKWddKxPOmE2APSglezDJlz8sXyfI",
    authDomain: "locum-af.firebaseapp.com",
    projectId: "locum-af",
    storageBucket: "locum-af.appspot.com",
    messagingSenderId: "670724039255",
    appId: "1:670724039255:web:75c231e8ded18bea0b3912",
    measurementId: "G-CCVBWGF1FL"
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

const googleAuth = async () => {
    await signInWithRedirect(auth, provider);
    res.json('google')
}

const signInWithGoogle = async (req, res) => {
    await getRedirectResult(auth)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access Google APIs.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;

            // The signed-in user info.
            const user = result.user;
            res.json(user)
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });
}

module.exports = { register, login, signInWithGoogle, googleAuth }