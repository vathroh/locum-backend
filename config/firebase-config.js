import firebaseadmin from "firebase-admin"
import accountkey from './serviceAccountKey.json'

const serviceAccount = accountkey;
const admin = firebaseadmin;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin