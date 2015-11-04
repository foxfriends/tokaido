'use strict';

module.exports = {
    'shokunin': {
        name: 'Shokunin',
        type: 'encounter',
        score(player) {
            return player.name === 'umegae' ? 1 : 0;
        },
        draw() {
            //Receive one Souvenir
        }
    },
    'annaibito-p': {
        name: 'Annaibito',
        type: 'encounter',
        score(player) {
            return player.name === 'umegae' ? 1 : 0;
        },
        draw() {
            //Receive one Paddy Panorama
        }
    },
    'annaibito-m': {
        name: 'Annaibito',
        type: 'encounter',
        score(player) {
            return player.name === 'umegae' ? 1 : 0;
        },
        draw() {
            //Receive one Mountain Panorama
        }
    },
    'annaibito-s': {
        name: 'Annaibito',
        type: 'encounter',
        score(player) {
            return player.name === 'umegae' ? 1 : 0;
        },
        draw() {
            //Receive one Sea Panorama
        }
    },
    'samurai': {
        name: 'Samurai',
        type: 'encounter',
        score(player) { return 3 + (player.name === 'umegae' ? 1 : 0); },
        draw() {
            //Worth 3 points
        }
    },
    'kuge': {
        name: 'Kuge',
        type: 'encounter',
        score(player) {
            return player.name === 'umegae' ? 1 : 0;
        },
        draw() {
            //Receive 3 coins
        }
    },
    'miko': {
        name: 'Miko',
        type: 'encounter',
        score(player) {
            return player.name === 'umegae' ? 1 : 0;
        },
        draw() {
            //Donate 1 coin from the Temple
        }
    }
};