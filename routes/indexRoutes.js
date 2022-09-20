const express = require("express");
const router = express.Router();
const verifyIdToken = require('../controllers/indexController.js')

const multer = require('multer')
const path = require("path")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "Images")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage })

router.post('/upload', upload.single('image'), (req, res) => {
    res.send('Image uploaded')
})
// router.get('/', verifyIdToken);

router.get('/', (req, res) => {
    res.send('<center><h1 style="margin-top:200px;">Hello from LOCUM App.</h1></center>')
});

module.exports = router;