'use strict';
let {get} = require('./index.js');

let shoema = (player) => {
    //1 point per Souvenir/Legendary
    return (function count(card, ...rest) {
        if(get(card).type === 'souvenir' || get(card).type === 'legendary') {
            return 1 + count(...rest);
        }
        return count(...rest);
    })(...player.cards);
};

module.exports = {
    'shodo': {
        name: 'Shodo',
        type: 'legendary',
        price: 1,
        score: shoema
    },
    'emaki': {
        name: 'Emaki',
        type: 'legendary',
        price: 1,
        score: shoema
    },
    'buppatsu': {
        name: 'Buppatsu',
        type: 'legendary',
        family: 5,
        price: 2,
        score() { }
    },
    'ema': {
        name: 'Ema',
        type: 'legendary',
        family: 5,
        price: 2,
        score() { }
    },
    'murasame': {
        name: 'Murasame',
        type: 'legendary',
        price: 3,
        score() { return 8; }
    },
    'masamune': {
        name: 'Masamune',
        type: 'legendary',
        price: 3    ,
        score() { return 8; }
    }
};
