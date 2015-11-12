'use strict';

module.exports = {
    'dango': {
        name: 'Dango',
        type: 'meal',
        price: 1,
        score(player) { return 6 + (player.traveller === 'nampo' ? this.price : 0); }
    },
    'nigirimeshi': {
        name: 'Nigirimeshi',
        type: 'meal',
        price: 1,
        score(player) { return 6 + (player.traveller === 'nampo' ? this.price : 0); }
    },
    'misoshiru': {
        name: 'Misoshiru',
        type: 'meal',
        price: 1,
        score(player) { return 6 + (player.traveller === 'nampo' ? this.price : 0); }
    },
    'tofu': {
        name: 'Tofu',
        type: 'meal',
        price: 2,
        score(player) { return 6 + (player.traveller === 'nampo' ? this.price : 0); }
    },
    'tempura': {
        name: 'Tempura',
        type: 'meal',
        price: 2,
        score(player) { return 6 + (player.traveller === 'nampo' ? this.price : 0); }
    },
    'sushi': {
        name: 'Sushi',
        type: 'meal',
        price: 2,
        score(player) { return 6 + (player.traveller === 'nampo' ? this.price : 0); }
    },
    'soba': {
        name: 'Soba',
        type: 'meal',
        price: 2,
        score(player) { return 6 + (player.traveller === 'nampo' ? this.price : 0); }
    },
    'yakitori': {
        name: 'Yakitori',
        type: 'meal',
        price: 2,
        score(player) { return 6 + (player.traveller === 'nampo' ? this.price : 0); }
    },
    'unagi': {
        name: 'Unagi',
        type: 'meal',
        price: 3,
        score(player) { return 6 + (player.traveller === 'nampo' ? this.price : 0); }
    },
    'udon': {
        name: 'Udon',
        type: 'meal',
        price: 3,
        score(player) { return 6 + (player.traveller === 'nampo' ? this.price : 0); }
    },
    'fugu': {
        name: 'Fugu',
        type: 'meal',
        price: 3,
        score(player) { return 6 + (player.traveller === 'nampo' ? this.price : 0); }
    },
    'tai meshi': {
        name: 'Tai Meshi',
        type: 'meal',
        price: 3,
        score(player) { return 6 + (player.traveller === 'nampo' ? this.price : 0); }
    },
    'sashimi': {
        name: 'Sashimi',
        type: 'meal',
        price: 3,
        score(player) { return 6 + (player.traveller === 'nampo' ? this.price : 0); }
    },
    'donburi': {
        name: 'Donburi',
        type: 'meal',
        price: 3,
        score(player) { return 6 + (player.traveller === 'nampo' ? this.price : 0); }
    }
};