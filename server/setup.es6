'use strict';
let data = require('./data');
let {updateData, io} = require('./common')();
let players = require('./players');
let {traveller} = require('../cards');

let alertAvailableColors = (game) => {
    //Update the colours available for choosing (before the game starts)
    let colors = ["white", "yellow", "blue", "green", "purple"];
    for(let player of data.iPlayer(game)) {
        for(let i in colors) {
            if(colors[i] == player.color) {
                colors.splice(i, 1);
                break;
            }
        }
    }
    io.to(game).emit('color:update', colors);
    return colors;
};

module.exports = (id) => {
    let player = players(id);
    let socket = player.socket();

    socket.on('color:change', (newColor, res) => {
        data.setPlayer(player.game(), player.name(), 'color', newColor);
        let colors = alertAvailableColors(player.game());
        res(null, colors);
    });
    socket.on('color:ready', (x, res) => {
        data.setPlayer(player.game(), player.name(), 'position', 0);
        updateData(player.game());
        res(data.get(player.game()).expansions);
    });
    socket.on('request:travellers', (x, res) => {
        let openPositions = [];
        for(let i = 0; i < data.players(player.game()); i++) {
            openPositions.push(i);
        }
        for(let i of data.iPlayer(player.game())) {
            if(i.position !== -1) {
                openPositions.splice(openPositions.indexOf(i.position[1]), 1);
            }
        }
        data.setPlayer(player.game(), player.name(), 'position', [0, openPositions[Math.floor(Math.random() * openPositions.length)]]);
        res(data.removeCard(player.game(), 'traveller', 2));
    });
    socket.on('submit:traveller', (name, res) => {
        data.setPlayer(player.game(), player.name(), 'traveller', name);
        data.setPlayer(player.game(), player.name(), 'coins', traveller[name].coins);
        updateData(player.game());
        res();
    });
};
module.exports.alertAvailableColors = alertAvailableColors;