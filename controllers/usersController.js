const { addUserModel, getUserByIdModel, updateUserModel, getUsersModel } = require('../models/usersModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const createUser = async (req, res) => {
	try {
		const user = await addUserModel(req.body);
		if (user) {
			const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
				expiresIn: '100h',
			});
			res.setHeader('Access-Control-Expose-Headers', 'Authorization');
			res.setHeader('Authorization', 'Bearer ' + token);
			res.status(200).send({
				name: user.name,
				id: user.id,
			});
		}
	} catch (err) {
		res.status(500).send(err);
	}
};

const loginUser = async (req, res) => {
	const { user, password } = req.body;
	try {
		bcrypt.compare(password, user.passwordHash, (err, result) => {
			if (err) {
				res.status(500).send(err);
			} else if (!result) {
				res.status(400).send("Password don't match");
			} else {
				const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
					expiresIn: '100h',
				});
				res.setHeader('Access-Control-Expose-Headers', 'Authorization');
				res.setHeader('Authorization', 'Bearer ' + token);
				res.status(200).send({
					name: user.name,
					id: user.id,
				});
			}
		});
	} catch (err) {
		res.status(500).send(err);
	}
};

module.exports = {
	createUser,
	loginUser,
};
