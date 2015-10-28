'use strict';

module.exports = {
    'foresight': {
        name: 'Foresight',
        score: () => {
            //2 points per coin
        }
    },
    'contemplation': {
        name: 'Contemplation',
        score: () => {
            //1 point per cherry tree, 3 per complete panorama
        }
    },
    'nostalgia': {
        name: 'Nostalgia',
        score: () => {
            //2 per legendary, 1 per souvenir
        }
    },
    'patience': {
        name: 'Patience',
        score: () => {
            //Earn 4 points for arriving last, 3 for second last, 2 otherwise
        }
    },
    'perfection': {
        name: 'Perfection',
        score: () => {
            //Earn 1 point per Calligraphy, 2 per Achievement
        }
    },
    'fasting': {
        name: 'Fasting',
        score: () => {
            //3 Points per uneaten Meal
        }
    }
};