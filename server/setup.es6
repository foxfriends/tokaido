'use strict';
let data = require('./data');
let {updateData, io} = require('./common')();
let players = require('./players');
let {traveller} = require('../cards');

let alertAvailableColors = (game) => {
    //Update the colours available for choosing (before the game starts)
    let colors = ["white", "yellow", "blue", "green", "purple"];
    for(let player of data.iPlayers(game)) {
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
        if(data.players(player.game()) === 2) {
            let colors = ['yellow','white','blue','green','purple'];
            for(let p of data.iPlayers(player.game())) {
                if(p.color !== '') {
                    colors.splice(colors.indexOf(p.color), 1);
                }
            }
            data.set(player.game(), 'extra', 'color', colors[Math.floor(Math.random() * 3)]);
        }
        let colors = alertAvailableColors(player.game());
        res(null, colors);
    });
    socket.on('color:ready', (x, res) => {
        updateData(player.game());
        res(data.get(player.game()).expansions);
    });
    socket.on('request:travellers', (x, res) => {
        let openPositions = [];
        for(let i = 0; i < Math.max(3, data.players(player.game())); i++) {
            openPositions.push(i);
        }
        for(let p of data.iPlayers(player.game())) {
            if(p.position !== -1) {
                openPositions.splice(openPositions.indexOf(p.position[1]), 1);
            }
        }
        data.setPlayer(player.game(), player.name(), 'position', [0, openPositions.splice(Math.floor(Math.random() * openPositions.length), 1)[0]]);
        if(data.players(player.game()) === 2) {
            data.set(player.game(), 'extra', 'position', [0, openPositions[0]]);
        }
        updateData(player.game());
        res(data.removeCard(player.game(), 'traveller', 2));
    });
    socket.on('submit:traveller', (name, res) => {
        data.setPlayer(player.game(), player.name(), 'traveller', name);
        data.setPlayer(player.game(), player.name(), 'coins', traveller[name].coins);
        updateData(player.game());
        res();
    });
    socket.on('game:ready', (state) => {
        data.set(player.game(), 'readystate', data.get(player.game()).readystate + 1);
        if(data.get(player.game()).readystate == data.get(player.game()).playerCount) {
            if(state > data.get(player.game()).state) {
                data.set(player.game(), 'state', state);
            }
            updateData(player.game());
            data.set(player.game(), 'readystate', 0);
            io.to(player.game()).emit('game:ready');
        }
    });
};
module.exports.alertAvailableColors = alertAvailableColors;