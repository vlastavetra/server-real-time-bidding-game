const express = require('express');
const { isAuth } = require('../middleware/userMiddleware.js');
const { getAllGames, createNewGame } = require('../controllers/gamesController.js');

const router = express.Router();

router.route('/').get(isAuth, getAllGames);
router.route('/new').post(isAuth, createNewGame);

module.exports = router;
