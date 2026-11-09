const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        socket.on('join-circle', (circleId) => {
            socket.join(`circle:${circleId}`);
        });

        socket.on('leave-circle', (circleId) => {
            socket.leave(`circle:${circleId}`);
        });

        socket.on('disconnect', () => {});
    });

    return io;
};

const getIo = () => io;

module.exports = { initSocket, getIo };
