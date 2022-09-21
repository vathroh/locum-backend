const express = require("express");
const router = express.Router();
const { authMiddleware, verifyIdToken } = require('../middleware/authMiddleware')

const multer = require('multer')
const path = require("path")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage })

router.post('/upload', upload.single('image'), (req, res) => {
    console.log(req.body);
    res.send('Image uploaded')
})

router.get('/verify', verifyIdToken);

router.get('/', authMiddleware, (req, res) => {
    res.send('<center><h1 style="margin-top:200px;">Hello from LOCUM App.</h1></center>')
});

module.exports = router;