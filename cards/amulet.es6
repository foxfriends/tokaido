'use strict';

module.exports = {
    'vitality': {
        name: 'Vitality',
        type: 'amulet',
        price: 1,
        play() {
            //Move again (if in the lead)
        }
    },
    'fortune': {
        name: 'Fortune',
        type: 'amulet',
        price: 1,
        play() {
            //Roll the fortune die and receive that many coins
        }
    },
    'health': {
        name: 'Health',
        type: 'amulet',
        price: 1,
        play() {
            //Take both actions on a space
        }
    },
    'friendship': {
        name: 'Friendship',
        type: 'amulet',
        price: 1,
        play() {
            //You may share a space
        }
    },
    'hospitality': {
        name: 'Hospitality',
        type: 'amulet',
        price: 1,
        play() {
            //Take your meal card for free
        }
    },
    'devotion': {
        name: 'Devotion',
        type: 'amulet',
        price: 1,
        play() {
            //Coins spent on a purchase go to the Temple
        }
    }
};