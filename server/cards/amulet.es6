'use strict';

module.exports = {
    'vitality': {
        name: 'Vitality',
        play: () => {
            //Move again (if in the lead)
        }
    },
    'fortune': {
        name: 'Fortune',
        play: () => {
            //Roll the fortune die and receive that many coins
        }
    },
    'health': {
        name: 'Health',
        points: 3,
        play: () => {
            //Take both actions on a space
        }
    },
    'friendship': {
        name: 'Friendship',
        play: () => {
            //You may share a space
        }
    },
    'hospitality': {
        name: 'Hospitality',
        play: () => {
            //Take your meal card for free
        }
    },
    'devotion': {
        name: 'Devotion',
        play: () => {
            //Coins spent on a purchase go to the Temple
        }
    }
};