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
const wss = new WebSocket.Server({ server });

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
const corsOptions = {
	origin: [process.env.LOCAL_URL, process.env.PRODUCTION_URL],
	credentials: true,
};
app.use(cors(corsOptions));

app.use('/user', usersRoutes);
app.use('/game', gamesRoutes);

app.get('/', (req, res) => {
	res.send('Hello World');
});

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
