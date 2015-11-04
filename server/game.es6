'use strict';
let data = require('./data');
let {updateData, io} = require('./common')();
let players = require('./players');
let cards = require('../cards');

module.exports = (id) => {
    let player = players(id);
    let socket = player.socket();

    socket.on('game:ready', (state) => {
        data.set(player.game(), 'readystate', data.get(player.game()).readystate + 1);
        if(data.get(player.game()).readystate == data.get(player.game()).playerCount) {
            if(state) {
                data.set(player.game(), 'state', state);
            }
            updateData(player.game());
            data.set(player.game(), 'readystate', 0);
            io.to(player.game()).emit('game:ready');
        }
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
        data.giveCard(player.game(), player.name(), ...souvenirs);
        if(souvenirs.length >= 2 && data.player(player.game(), player.name()).traveller === 'sasayakko') {
            //Sasayakko does not pay for the cheapest souvenir
            coins += min;
        } else if(data.player(player.game(), player.name()).traveller === 'zen-emon') {
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
};