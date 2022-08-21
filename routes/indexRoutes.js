const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.json('Hello from LOCUM App.')
});



module.exports = router;