'use strict';
let games = {};

module.exports = {
    get: (g) => games[g],
    set: (g,f,d) => d !== undefined ? games[g][f] = d : games[g] = f,
    remove: (g) => delete games[g],
    iPlayer: function*(g) {
        for(let name of Object.keys(games[g].players)) {
            yield games[g].players[name];
        }
    },
    getName: (g,i) => Object.keys(games[g].players)[i],
    getPlayer: (g,p) => games[g].players[p],
    setPlayer: (g,p,f,d) => games[g].players[p][f] = d,
    removePlayer: (g, p) => delete games[g].players[p],
    players: (g) => Object.keys(games[g].players).length,
    make: (g) => games[g] = {
        state: 0,
        playerCount: 1,
        readystate: 0,
        expansions: {
            crossroads: false
        },
        cards: {
            traveller: ['hiroshige', 'chuubei', 'kinko', 'yoshiyasu', 'satsuki',
                        'mitsukuni', 'sasayakko', 'hirotada', 'umegae', 'zen-emon'],
            cr_traveller: ['jirocho', 'daigoro', 'nampo', 'gotozaemon', 'miyataka', 'kita'],
            encounter: ['shokunin', 'shokunin', 'annaibito-p', 'annaibito-p', 'annaibito-m',
                        'annaibito-m', 'annaibito-s', 'annaibito-s', 'samurai', 'samurai',
                        'kuge', 'kuge', 'miko', 'miko'],
            souvenir: ['haori', 'koma', 'manju', 'shanisen'],
            meal: ['dango'],
            hot_springs: [2,2,2,2,2,2,3,3,3,3,3,3],
            bathouse: 6,
            cherry_tree: 6,
            legendary: ['shodo', 'emaki', 'buppatsu', 'ema', 'murasame', 'masamune'],
            calligraphy: ['foresight', 'contemplation', 'nostalgia', 'patience', 'perfection', 'fasting'],
            amulet: ['vitality', 'fortune', 'health', 'friendship', 'hospitality', 'devotion']
        },
        mealset: [],
        extra: {
            //Extra character for 2 player mode
            turn: 0,
            position: 0
        },
        players: {}
    },
    makePlayer: (g, p) => games[g].players[p] = {
        color: '',
        character: '',
        money: 0,
        donations: 0,
        cards: {
            encounter: [],
            souvenir: [],
            meal: [],
            hot_springs: [],
            bathouse: 0,
            cherry_tree: 0,
            legendary: [],
            calligraphy: [],
            amulet: []
        },
        position: -1,
        connected: true
    }
};