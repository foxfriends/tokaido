'use strict';
let data = require('./data');
let {updateData, io} = require('./common')();
let players = require('./players');

module.exports = (id) => {
    let player = players(id);
    let socket = player.socket();

    socket.on('game:ready', () => {
        data.set(player.game(), 'readystate', data.get(player.game()).readystate + 1);
        if(data.get(player.game()).readystate == data.get(player.game()).playerCount) {
            updateData(player.game());
            data.set(player.game(), 'readystate', 0);
            io.to(player.game()).emit('game:ready');
        }
    });
    socket.on('request:travellers', (x, res) => {
        
    });
};