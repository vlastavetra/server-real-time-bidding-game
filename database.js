const sqlite = require('sqlite');
const sqlite3 = require('sqlite3').verbose();

async function setupDatabase() {
	console.log('Setting up database');
	const db = await sqlite.open({
		filename: 'db-real-time-bidding-game.db',
		driver: sqlite3.Database,
	});

	return db;
}
module.exports = setupDatabase;
