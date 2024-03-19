const schedule = require('node-schedule');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const { handleWebSocketMessage } = require('./controllers/gamesController.js');
const { checkForFinishedGames } = require('./models/gamesModels.js');

dotenv.config();

const usersRoutes = require('./routes/usersRoutes.js');
const gamesRoutes = require('./routes/gamesRoutes.js');

const app = express();
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); // i tried to use wss with self-signed certificate for more security but my google chrome blocked it.
//in real life i would use real certificate and would not transfer the token in this bad way - only in headers

const gameSubscriptions = {};

wss.on('connection', function connection(ws) {
	ws.on('message', async function incoming(message) {
		const data = JSON.parse(message);

		if (data.action === 'subscribe' && data.game_id) {
			if (!gameSubscriptions[data.game_id]) {
				gameSubscriptions[data.game_id] = new Set();
			}
			gameSubscriptions[data.game_id].add(ws);
			const answer = await handleWebSocketMessage(message);
			ws.send(JSON.stringify(answer));
		} else {
			const answer = await handleWebSocketMessage(message);

			const subscribers = gameSubscriptions[data.game_id] || [];
			subscribers.forEach(client => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify(answer));
				}
			});
		}
	});
});

schedule.scheduleJob('*/10 * * * * *', function () {
	checkForFinishedGames(gameSubscriptions);
});

app.use(express.json());
app.use(cors({ origin: ['http://localhost:3000'], credentials: true }));
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	next();
});

app.use('/user', usersRoutes);
app.use('/game', gamesRoutes);

app.use('*', (req, res) => {
	res.status(404).send({ message: 'Oops page not found' });
});

app.use((err, req, res, next) => {
	res.status(err.statusCode).send(err.message);
});

async function init() {
	server.listen(PORT, () => {
		console.log(`Listening on ${PORT}`);
	});
}

init();
