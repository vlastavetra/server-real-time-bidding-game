const { getAllGamesModel, addGameModel, getGameModel, makeNewBidModel } = require('../models/gamesModels');
const { verifyToken } = require('../middleware/userMiddleware.js');
require('dotenv').config();

const getAllGames = async (req, res) => {
	try {
		const games = await getAllGamesModel();
		res.status(200).send(games);
	} catch (err) {
		res.status(500).send(err);
	}
};

const createNewGame = async (req, res) => {
	try {
		const game = await addGameModel(req.body);
		if (game) {
			res.status(200).send({
				game,
			});
		}
	} catch (err) {
		res.status(500).send(err);
	}
};

const handleWebSocketMessage = async message => {
	const data = JSON.parse(message);

	if (data.token) {
		const user_id = await verifyToken(data.token);
		if (user_id) {
			if (data.bid_amount) {
				const updatedGame = await makeNewBidModel(data, user_id);
				return updatedGame;
			} else {
				const result = await getGameModel(data.game_id);
				return result;
			}
		}
	} else {
		return { error: 'Unauthorized' };
	}
};

module.exports = {
	getAllGames,
	createNewGame,
	handleWebSocketMessage,
};
