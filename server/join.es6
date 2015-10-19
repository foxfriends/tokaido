'use strict';
let data = require('./data.es6');
let players = require('./players');
let {io} = require('./common')();
let {alertAvailableColors} = require('./colorPhase');

let leave = (id) => {
    let player = players(id);
    let game = player.game(), name = player.name(), socket = player.socket();
    if(game !== undefined) {
        data.setPlayer(game, name, 'connected', false);
        socket.leave(game);
        if(data.get(game).state === 0) {
            //Remove the player if they back out before the game starts
            data.removePlayer(game, name);
            if(data.players(game) === 0) {
                data.remove(game);
            } else {
                alertAvailableColors(game);
            }
        }
    }
    players.removePlayer(id);
};

module.exports = (id) => {
    let player = players(id);
    let socket = player.socket();

    socket.on('disconnect', () => leave(id));
    socket.on('game:leave', () => leave(id));
    socket.on('game:join', ({game, name}, res) => {
        if(data.get(game) === undefined) { data.make(game); }
        if(data.getPlayer(game, name) === undefined) {
            //Check if the player joining is able to join
            if(data.get(game).state !== 0) {
                //Started already
                return res(`The game ${game} has left without you`, []);
            } else if(data.players(game) >= 5) {
                //Full
                return res(`The game ${game} is full`, []);
            }
            //Success!
            data.makePlayer(game, name);
        } else if(data.getPlayer(game, name).connected) {
            //Already joined in another tab
            game = undefined;
            return res(`${name} is already in this game`, []);
        }
        //Join room, set session values, and begin
        player.set('name', name);
        player.set('game', game);
        socket.join(game);
        data.setPlayer(game, name, 'connected', true);
        let colors = "skip";
        if(data.get(game).state === 0) {
            //Skip the colour chooser if the game has already started
            colors = alertAvailableColors(game);
        }
        return res(null, colors);
    });
};