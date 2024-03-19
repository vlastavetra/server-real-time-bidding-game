const setupDatabase = require('../database');

setupDatabase()
	.then(db => {})
	.catch(error => {
		console.error('Error setting up the database:', error);
	});

async function getUserByEmailModel(email) {
	try {
		const db = await setupDatabase();
		const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
		return user;
	} catch (error) {
		console.error('Error in getUserByEmail:', error);
		throw error;
	}
}

async function addUserModel({ name, email, passwordHash }) {
	try {
		const db = await setupDatabase();
		const result = await db.run('INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)', [
			name,
			email,
			passwordHash,
		]);
		return { id: result.lastID, name, email };
	} catch (error) {
		console.error('Error in createUser:', error);
		throw error;
	}
}

module.exports = {
	getUserByEmailModel,
	addUserModel,
};
