'use strict';
let players = {};

module.exports = (id) => ({
    name: () => players[id].name,
    game: () => players[id].game,
    socket: () => players[id].socket,
    set: (f,d) => players[id][f] = d
});
module.exports.addPlayer = (socket) => players[socket.id] = {socket: socket};
module.exports.removePlayer = (id) => delete players[id];