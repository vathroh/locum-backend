const express = require("express");
const router = express.Router();

const {
    getUsers,
    getUserById,
    saveUser,
    updateUser,
    deleteUser
} = require("../controllers/userController.js");


router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', saveUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);


module.exports = router;