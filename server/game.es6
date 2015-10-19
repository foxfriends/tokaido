'use strict';
let data = require('./data');
let {updateData, io} = require('./common')();
let players = require('./players');

module.exports = (id) => {
    let player = players(id);
    let socket = player.socket();

    socket.on('game:start', (newColor, res) => {

    });
};