'use strict';
let data = require('./data');
let io;
export let updateData = (game) => {
    let d = data.get(game);
    //Replace cards with just a card count
    for(let i of Object.keys(d.cards)) {
        d.cards[i] = d.cards[i].length;
    }
    io.to(game).emit('data:update', JSON.stringify(d));
};
module.exports = (socketio) => {
    if (socketio !== undefined) { io = socketio; }
    return {
        io: io,
        updateData: updateData
    };
};