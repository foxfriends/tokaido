'use strict';
let games = {};

module.exports = {
    get: (g) => games[g],
    set: (g,d) => games[g] = d,
    remove: (g) => delete games[g],
    iPlayer: function*(g) {
        for(let name of Object.keys(games[g].players)) {
            yield games[g].players[name];
        }
    },
    getPlayer: (g,p) => games[g].players[p],
    setPlayer: (g,p,f,d) => games[g].players[p][f] = d,
    removePlayer: (g, p) => delete games[g].players[p],
    players: (g) => Object.keys(games[g].players).length,
    make: (g) => games[g] = {
        state: 0,
        extra: {
            //Extra character for 2 player mode
            turn: 0,
            position: 0
        },
        players: {/*
            name: {
                color: '',
                character: '',
                money: 0,
                donations: 0,
                cards: [],
                position: 0,
                connected: true
            } */
        }
    },
    makePlayer: (g, p) => games[g].players[p] = {
        color: '',
        character: '',
        money: 0,
        donations: 0,
        cards: [],
        position: -1,
        connected: true
    }
};