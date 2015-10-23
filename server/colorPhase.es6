'use strict';
let data = require('./data');
let {updateData, io} = require('./common')();
let players = require('./players');
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
};
module.exports.alertAvailableColors = alertAvailableColors;