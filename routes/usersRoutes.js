const express = require('express');
const {
	validateUserData,
	validateUserLoginData,
	isNewUser,
	hashPwd,
	doesUserExist,
	isAuth,
} = require('../middleware/userMiddleware.js');
const { createUser, loginUser } = require('../controllers/usersController.js');

const router = express.Router();

router.route('/register').post(validateUserData, isNewUser, hashPwd, createUser);
router.route('/login').post(validateUserLoginData, doesUserExist, loginUser);

module.exports = router;
