'use strict';
let data = require('./data');
let io;
export let updateData = (game) => {
    io.to(game).emit('data:update', JSON.stringify(data.get(game)));
};
module.exports = (socketio) => {
    if (socketio !== undefined) { io = socketio; }
    return {
        io: io,
        updateData: updateData
    };
};