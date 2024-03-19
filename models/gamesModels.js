const setupDatabase = require('../database');

setupDatabase()
	.then(db => {})
	.catch(error => {
		console.error('Error setting up the database:', error);
	});

async function getAllGamesModel() {
	try {
		const db = await setupDatabase();
		const games = await db.all(`SELECT 
		games.*,
		MAX(bids.bid_amount) AS max_bid_amount,
		users.name AS user_name,
		bids.timestamp AS bid_timestamp,
		COUNT(DISTINCT users_games.user_id) AS user_count
		FROM 
				games
		LEFT JOIN 
				bids ON games.id = bids.game_id
		LEFT JOIN 
				users ON bids.user_id = users.id
		LEFT JOIN 
				users_games ON games.id = users_games.game_id
		GROUP BY 
		games.id`);
		return games;
	} catch (error) {
		console.error('Error in getAllGamesModel:', error);
		throw error;
	}
}

async function addGameModel({ user_id, bid_amount }) {
	const db = await setupDatabase();

	try {
		await db.run('BEGIN TRANSACTION;');
		const gameResult = await db.run(`
			INSERT INTO games (start_time, end_time)
			VALUES (DATETIME(CURRENT_TIMESTAMP, '+120 minutes'), DATETIME(CURRENT_TIMESTAMP, '+123 minutes'));
		`);
		const new_game_id = gameResult.lastID;
		await db.run(
			'INSERT INTO bids (user_id, game_id, bid_amount, timestamp) VALUES (?, ?, ?, DATETIME(CURRENT_TIMESTAMP, "+120 minutes"))',
			[user_id, new_game_id, bid_amount],
		);
		await db.run('INSERT INTO users_games (user_id, game_id, type) VALUES (?, ?, "gamer")', [user_id, new_game_id]);
		await db.run('COMMIT;');

		return new_game_id;
	} catch (error) {
		console.error('Error in addGameModel:', error);
		await db.run('ROLLBACK;');
		throw error;
	}
}

async function getGameByIdModel(game_id, db) {
	try {
		const gameData = await db.get('SELECT * FROM games WHERE id = ?', [game_id]);
		const bidData = await db.all(
			`
			SELECT 
					bids.id, 
					bids.bid_amount, 
					bids.timestamp, 
					users.name,
					users_games.type as user_game_type
			FROM bids 
			JOIN users ON bids.user_id = users.id 
			LEFT JOIN  users_games ON bids.user_id = users_games.user_id AND bids.game_id = users_games.game_id
			WHERE bids.game_id = ?
			`,
			[game_id],
		);
		const usersData = await db.all(
			`
				SELECT 
						users_games.*, 
						users.id, 
						users.name, 
						bid_counts.bid_count
				FROM users_games 
				JOIN users ON users_games.user_id = users.id
				LEFT JOIN 
						(SELECT 
								user_id, 
								COUNT(*) as bid_count 
						FROM 
								bids 
						WHERE 
								game_id = ? 
						GROUP BY 
								user_id
						) AS bid_counts ON users_games.user_id = bid_counts.user_id
				WHERE 
						users_games.game_id = ?
		`,
			[game_id, game_id],
		);
		return {
			game_id: gameData?.id,
			start: gameData?.start_time,
			end: gameData?.end_time,
			bids: bidData,
			users_data: usersData,
		};
	} catch (error) {
		console.error('Error in getGameModel:', error);
		throw error;
	}
}

async function makeNewBidModel(data, user_id) {
	try {
		const db = await setupDatabase();

		await db.run('BEGIN TRANSACTION');

		const bidResult = await db.run(
			'INSERT INTO bids (user_id, game_id, bid_amount, timestamp) VALUES (?, ?, ?, DATETIME(CURRENT_TIMESTAMP, "+120 minutes"))',
			[user_id, data.game_id, data.bid_amount],
		);
		const bid_id = bidResult.lastID;

		const exists = await db.get('SELECT * FROM users_games WHERE user_id = ? AND game_id = ?', [user_id, data.game_id]);
		if (!exists) {
			await db.run('INSERT INTO users_games (user_id, game_id, type) VALUES (?, ?, "gamer")', [user_id, data.game_id]);
		}

		await db.run('COMMIT');

		if (bid_id) {
			return getGameByIdModel(data.game_id, db);
		}
	} catch (error) {
		await db.run('ROLLBACK');
		console.error('Error in makeNewBidModel:', error);
		throw error;
	}
}

async function getGameModel(game_id) {
	try {
		const db = await setupDatabase();
		const data = await getGameByIdModel(game_id, db);
		return data;
	} catch (error) {
		console.error('Error in getGameModel:', error);
		throw error;
	}
}

async function checkForFinishedGames(gameSubscriptions) {
	const db = await setupDatabase();
	const finishedGames = await db.all(`
	SELECT games.*
	FROM games
	WHERE games.end_time <= DATETIME(CURRENT_TIMESTAMP, '+120 minutes') 
  AND NOT EXISTS (
    SELECT 1 FROM users_games 
    WHERE users_games.game_id = games.id AND users_games.type = 'winner'
  );
	`);

	for (const game of finishedGames) {
		const winnerData = await db.get(
			`
				SELECT 
						user_id, 
						COUNT(*) as bid_count, 
						MAX(bid_amount) as max_bid
				FROM 
						bids
				WHERE 
						game_id = ?
				GROUP BY 
						user_id
				ORDER BY 
						bid_count DESC, max_bid DESC
				LIMIT 1
		`,
			[game.id],
		);

		if (winnerData && winnerData.user_id) {
			await db.run(
				`
					UPDATE users_games
					SET type = 'winner'
					WHERE game_id = ? AND user_id = ?
					`,
				[game.id, winnerData.user_id],
			);
		}
		const answer = await getGameByIdModel(game.id, db);

		const subscribers = gameSubscriptions[game.id] || new Set();
		subscribers.forEach(client => {
			client.send(JSON.stringify(answer));
		});
	}
}

module.exports = {
	getAllGamesModel,
	addGameModel,
	getGameModel,
	makeNewBidModel,
	checkForFinishedGames,
};
