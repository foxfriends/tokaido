'use strict';
let data = require('./data');
let {updateData, io} = require('./common')();
let players = require('./players');
let cards = require('../cards');

module.exports = (id) => {
    let player = players(id);
    let socket = player.socket();

    socket.on('turn:move', ([who, where], res) => {
        if(who !== 'extra') {
            data.setPlayer(player.game(), who, 'position', where);
        } else {
            data.set(player.game(), 'extra', 'position', where);
        }
        updateData(player.game());
        res();
    });
    socket.on('turn:end', () => {
        updateData(player.game());
        io.to(player.game()).emit('turn:end');
    });
    socket.on('acquire:coins', (n, res) => {
        data.setPlayer(player.game(), player.name(), 'coins', data.getPlayer(player.game(), player.name()).coins + n);
        updateData(player.game());
        res();
    });
    socket.on('acquire:spring', (x, res) => {
        const c = data.removeCard(player.game(), 'hot_springs');
        data.giveCard(player.game(), player.name(), ...c);
        updateData(player.game());
        res(c);
    });
    socket.on('acquire:encounter', (x, res) => {
        const c = data.removeCard(player.game(), 'encounter');
        if(data.getPlayer(player.game(), player.name()).traveller === 'umegae') {
            data.setPlayer(player.game(), player.name(), 'coins', data.getPlayer(player.game(), player.name()).coins + 1);
        }
        data.giveCard(player.game(), player.name(), ...c);
        updateData(player.game());
        res(c);
    });
    socket.on('request:encounters', (x, res) => {
        res(data.getCard(player.game(), 'encounter', 0, 2));
    });
    socket.on('submit:encounter', (which, res) => {
        const cards = data.removeCard(player.game(), 'encounter', 2);
        if(cards[0] === which) {
            data.addCard(player.game(), 'encounter', cards[1]);
        } else {
            data.addCard(player.game(), 'encounter', cards[0]);
        }
        data.giveCard(player.game(), player.name(), which);
        updateData(player.game());
        res();
    });
    socket.on('acquire:panorama', (type, res) => {
        let n = 1;
        for(let card of data.getPlayer(player.game(), player.name()).cards) {
            if(card.substr(0, type.length) === type) {
                n++;
            }
        }
        if(n > {paddy:3,mountain:4,sea:5}[type]) {
            return res([`You have already finished the ${type} panorama`]);
        }
        data.giveCard(player.game(), player.name(), `${type}${n}`);
        updateData(player.game());
        res([`${type}${n}`]);
    });
    socket.on('request:souvenirs', (x, res) => {
        res(data.getCard(player.game(), 'souvenir', 0, 3));
    });
    socket.on('submit:souvenirs', ([souvenirs, which], res) => {
        let min = 3;
        const price = souvenirs
                        .map((name) => {
                            const p = cards.get(name).price;
                            min = Math.min(min, p);
                            return p;
                        })
                        .reduce((p, c) => p + c, 0);
        let coins = data.getPlayer(player.game(), player.name()).coins - price;
        if(coins < 0) { return res('You can\'t afford all that'); }
        for(let i = 0; i < 3; i++) {
            const card = data.removeCard(player.game(), 'souvenir');
            if(souvenirs.indexOf(card) === -1) {
                data.addCard(player.game(), 'souvenir', card);
            }
        }
        data.giveCard(player.game(), player.name(), ...souvenirs);
        if(souvenirs.length >= 2 && data.getPlayer(player.game(), player.name()).traveller === 'sasayakko') {
            //Sasayakko does not pay for the cheapest souvenir
            coins += min;
        } else if(data.getPlayer(player.game(), player.name()).traveller === 'zen-emon') {
            //Zen-emon pays only 1 coin for one of the souvenirs
            coins += cards.get(which).price - 1;
        }
        data.setPlayer(player.game(), player.name(), 'coins', coins);
        updateData(player.game());
        res();
    });
    socket.on('acquire:souvenir', (x, res) => {
        const card = data.removeCard(player.game(), 'souvenir');
        data.giveCard(player.game(), player.name(), ...card);
        updateData(player.game());
        res(card);
    });
    socket.on('request:meals', (first, res) => {
        if(first) {
            data.set(player.game(), 'mealset', data.removeCard(player.game(), 'meal', data.players(player.game(), true) + 1));
        }
        res(data.get(player.game()).mealset);
    });
    socket.on('discard:meal', (x, res) => {
        data.discardMeal(player.game(), data.get(player.game()).mealset[Math.floor(Math.random() * data.get(player.game()).mealset.length)]);
        res();
    });
    socket.on('submit:meal', ([which, special], res) => {
        if(which !== null) {
            const {price} = cards.get(which);
            const {coins} = data.getPlayer(player.game(), player.name());
            if(price <= coins || special === 'satsuki') {
                if(special !== 'eriku') {
                    data.discardMeal(player.game(), which);
                }
                data.giveCard(player.game(), player.name(), which);
                if(special !== 'satsuki') {
                    data.setPlayer(player.game(), player.name(), 'coins', coins - price);
                }
            } else {
                return res('You can\'t afford this meal');
            }
        }
        updateData(player.game());
        res();
    });
    socket.on('request:eriku_meal', (x, res) => {
        res(data.removeCard(player.game(), 'meal'));
    });
    socket.on('donate', ([amt, free], res) => {
        const {coins, donations} = data.getPlayeR(player.game(), player.name());
        data.setPlayer(player.game(), player.name(), 'donations', donations + amt);
        if(!free) {
            data.setPlayer(player.game(), player.name(), 'coins', coins - amt);
        }
        updateData(player.game());
        res();
    });
};