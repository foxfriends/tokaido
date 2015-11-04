'use strict';
let data = require('./data');
let players = require('./players');
let {io} = require('./common')();
let {alertAvailableColors} = require('./setup');
const {JOIN, SETUP} = require('./const');

let leave = (id) => {
    let player = players(id);
    let game = player.game(), name = player.name(), socket = player.socket();
    if(game !== undefined) {
        data.setPlayer(game, name, 'connected', false);
        socket.leave(game);
        if(data.get(game).state === SETUP) {
            io.to(game).emit('error', `${name} has abandoned this journey. Please reload the page.`);
        }
        if(data.get(game).state <= SETUP) {
            //Remove the player if they back out before the game starts
            data.removePlayer(game, name);
            if(data.players(game) === 0) {
                data.remove(game);
            } else if(data.get(game).state === JOIN) {
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
        let action = {
            colors: 'skip',
            options: 'skip'
        };
        if(data.get(game) === undefined) { data.make(game); }
        if(data.getPlayer(game, name) === undefined) {
            //Check if the player joining is able to join
            if(data.get(game).state !== 0) {
                //Started already
                return res(`The game ${game} has left without you`, {});
            } else if(data.get(game).playerCount === 1 && data.players(game) >= 1) {
                //Not set up yet
                return res(`Please wait while ${data.getName(game, 0)} plans your journey`, {});
            } else if(data.players(game) >= data.get(game).playerCount) {
                //Full
                return res(`The game ${game} is full`, {});
            }
            if(data.get(game).playerCount === 1) {
                //Not set up yet, so set up now
                action.options = 'set';
            }
            //Success!
            data.makePlayer(game, name);
            action.colors = alertAvailableColors(game);
        } else if(data.getPlayer(game, name).connected) {
            //Already joined in another tab
            game = undefined;
            return res(`${name} is already in this game`, {});
        }
        //Join room, set session values, and begin
        player.set('name', name);
        player.set('game', game);
        io.to(game).emit('success', `${name} has arrived.`);
        socket.join(game);
        data.setPlayer(game, name, 'connected', true);
        return res(null, action);
    });
    socket.on('options:set', (opts, res) => {
        data.set(player.game(), 'playerCount', parseInt(opts.playerCount));
        data.set(player.game(), 'expansions', { crossroads: opts.crossroads });
        if(data.get(player.game()).expansions.crossroads) {
            //Add the crossroads traveller cards
            let cards = data.get(player.game()).cards;
            cards.traveller = cards.traveller.concat(cards.cr_traveller);
            data.set(player.game(), 'cards', cards);
        }
        if(data.get(player.game()).expansions.eriku) {
            let cards = data.get(player.game()).cards;
            cards.traveller = cards.traveller.push('eriku');
            data.set(player.game(), 'cards', cards);
        }
        data.shuffleCards(player.game(), 'traveller');
        res();
    });
};