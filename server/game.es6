'use strict';
let data = require('./data');
let {updateData, io} = require('./common')();
let players = require('./players');
let travellers = require('./cards');

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
        let cards = [   travellers(data.removeCard(player.game(), 'traveller')[0]).name,
                        travellers(data.removeCard(player.game(), 'traveller')[0]).name  ];
        res(cards);
    });
    socket.on('submit:traveller', (name, res) => {
        data.setPlayer(player.game(), player.name(), 'traveller', name);
        data.setPlayer(player.game(), player.name(), 'coins', travellers(name).coins);
        updateData(player.game());
    });
};