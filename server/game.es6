'use strict';
let data = require('./data');
let {updateData, io} = require('./common')();
let players = require('./players');
let {traveller} = require('./cards');

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
        let cards = [   data.removeCard(player.game(), 'traveller')[0],
                        data.removeCard(player.game(), 'traveller')[0]  ];
        res(cards);
    });
    socket.on('submit:traveller', (name, res) => {
        data.setPlayer(player.game(), player.name(), 'traveller', name);
        data.setPlayer(player.game(), player.name(), 'coins', traveller[name].coins);
        updateData(player.game());
        res();
    });
};