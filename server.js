require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const initSockets = require('./src/sockets');

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });
  app.set('io', io);
  initSockets(io);
  server.listen(PORT, () => console.log(`TuneStream running on port ${PORT}  |  Docs: /api-docs`));
})();
