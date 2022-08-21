const express = require("express");
const router = express.Router();

const {
    getUserRoles,
    getUserRoleById,
    saveUserRole,
    updateUserRole,
    deleteUserRole
} = require("../controllers/UserRoleController.js");


router.get('/', getUserRoles);
router.get('/:id', getUserRoleById);
router.post('/', saveUserRole);
router.patch('/:id', updateUserRole);
router.delete('/:id', deleteUserRole);


module.exports = router;