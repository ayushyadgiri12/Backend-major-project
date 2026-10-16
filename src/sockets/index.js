const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // Authenticate sockets with the same JWT used by the REST API
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      socket.userId = jwt.verify(token, process.env.JWT_SECRET).id;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    // Live playlist updates: clients join a playlist "room"
    socket.on('playlist:join', (id) => socket.join(`playlist:${id}`));
    socket.on('playlist:leave', (id) => socket.leave(`playlist:${id}`));

    // "Now playing" broadcast so friends/dashboards can see live activity
    socket.on('now-playing', ({ trackId }) => {
      socket.broadcast.emit('now-playing', { userId: socket.userId, trackId, at: Date.now() });
    });
  });
};
