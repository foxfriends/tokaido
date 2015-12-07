'use strict';
let fs = require('fs');
let data = require('./data');
let {PLAY} = require('./const');
let io;
export let updateData = (game) => {
    let d = data.get(game);
    if(d.state >= PLAY) {
        fs.writeFile(`./games/${game}.tokaido`, JSON.stringify(d), (err) => {
            if(err) { return console.error(err); }
        });
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