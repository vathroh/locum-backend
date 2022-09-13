const express = require("express");
const router = express.Router();
const verifyIdToken = require('../controllers/indexController.js')


// router.get('/', verifyIdToken);

router.get('/', (req, res) => {
    res.send('<center><h1 style="margin-top:200px;">Hello from LOCUM Appfegrgg.</h1></center>')
});

module.exports = router;