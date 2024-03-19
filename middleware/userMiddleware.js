const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getUserByEmailModel, getUserByIdModel } = require('../models/usersModels');

const validateUserData = async (req, res, next) => {
	const { name, email, password } = req.body;
	if (!name || !email || !password) {
		res.status(400).send('Required provide all values');
		return;
	}
	next();
};

const validateUserLoginData = async (req, res, next) => {
	const { email, password } = req.body;
	if (!email || !password) {
		res.status(400).send('Required provide all values');
		return;
	}
	next();
};

const isNewUser = async (req, res, next) => {
	try {
		const user = await getUserByEmailModel(req.body.email);
		if (user) {
			res.status(400).send('User already exists');
			return;
		}
		next();
	} catch (error) {
		res.status(500).send('An error occurred');
	}
};

const doesUserExist = async (req, res, next) => {
	const user = await getUserByEmailModel(req.body.email);
	if (!user) {
		res.status(400).send(err);
		return;
	}

	req.body.user = user;
	next();
};

const hashPwd = (req, res, next) => {
	if (req.body.password) {
		const saltRounds = 10;
		bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
			if (err) {
				res.status(500).send(err);
				return;
			}
			req.body.passwordHash = hash;
			next();
		});
	}
};

const verifyToken = token => {
	return new Promise((resolve, reject) => {
		jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
			if (err) {
				resolve();
			} else {
				resolve(decoded.id);
			}
		});
	});
};

async function isAuth(req, res, next) {
	if (!req.headers.authorization) {
		res.status(401).send('Authorization headers required');
		return;
	}
	const token = req.headers.authorization.replace('Bearer ', '');
	const user_id = await verifyToken(token);
	if (user_id) {
		req.body.user_id = user_id;
		next();
	}
}

const getUserId = (req, res, next) => {
	if (!req.headers.authorization) {
		return;
	}
	const token = req.headers.authorization.replace('Bearer ', '');
	jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
		if (err) {
			res.status(401).send('Unauthorized');
			return;
		}

		if (decoded) {
			req.body.userId = decoded.id;
			next();
		}
	});
};

module.exports = {
	validateUserData,
	validateUserLoginData,
	isNewUser,
	hashPwd,
	doesUserExist,
	verifyToken,
	isAuth,
	getUserId,
};
