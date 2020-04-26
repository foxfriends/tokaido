'use strict';
let {get} = require('./index.js');

module.exports = {
    'foresight': {
        name: 'Foresight',
        type: 'calligraphy',
        price: 1,
        score(player) {
            //2 points per coin
            return 2 * player.coins;
        }
    },
    'contemplation': {
        name: 'Contemplation',
        type: 'calligraphy',
        price: 1,
        score(player) {
            //1 point per cherry tree, 3 per complete panorama
            return (function count(card, ...rest) {
                if(card === 'cherry tree') {
                    return 1 + count(...rest);
                } else if(card === 'paddy3') {
                    return 3 + count(...rest);
                } else if(card === 'mountain4') {
                    return 3 + count(...rest);
                } else if(card === 'sea5') {
                    return 3 + count(...rest);
                }
                return count(...rest);
            })(...player.cards);
        }
    },
    'nostalgia': {
        name: 'Nostalgia',
        type: 'calligraphy',
        price: 1,
        score(player) {
            //2 per legendary, 1 per souvenir
            return (function count(card, ...rest) {
                if(get(card).type === 'souvenir') {
                    return 1 + count(...rest);
                } else if(get(card).type === 'legendary') {
                    return 2 + count(...rest);
                }
                return count(...rest);
            })(...player.cards);
        }
    },
    'patience': {
        name: 'Patience',
        type: 'calligraphy',
        price: 1,
        score(player) {
            //Earn 4 points for arriving last, 3 for second last, 2 otherwise
        }
    },
    'perfection': {
        name: 'Perfection',
        type: 'calligraphy',
        price: 1,
        score(player) {
            //Earn 1 point per Calligraphy, 2 per Achievement
            return (function count(card, ...rest) {
                if(get(card).type === 'calligraphy') {
                    return 1 + count(...rest);
                } else if(get(card).type === 'achievement') {
                    return 2 + count(...rest);
                }
                return count(...rest);
            })(...player.cards);
        }
    },
    'fasting': {
        name: 'Fasting',
        type: 'calligraphy',
        price: 1,
        score(player) {
            //3 Points per uneaten Meal
            let n = (player.traveller === 'eriku' ? 5 : 4);
            for(let card of player.cards) {
                if(get(card).type === 'meal') { n--; }
            }
            return 3 * n;
        }
    }
};
