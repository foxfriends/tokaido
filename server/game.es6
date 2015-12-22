'use strict';
const data = require('./data');
const {updateData, io} = require('./common')();
const players = require('./players');
const cards = require('../cards');

module.exports = (id) => {
    const player = players(id);
    const socket = player.socket();
    const sendEvent = (ev, data) => { socket.broadcast.to(player.game()).emit('game:event', [ev, data]); };
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
        sendEvent('coins', {coins: n, name: player.name()});
        res();
    });
    socket.on('acquire:spring', (x, res) => {
        const c = data.removeCard(player.game(), 'springs');
        data.giveCard(player.game(), player.name(), ...c);
        updateData(player.game());
        sendEvent('cards', {
            cards: [{name: c, type: 'springs'}],
            take: true,
            name: player.name()
        });
        res(c);
    });
    socket.on('acquire:encounter', (x, res) => {
        const c = data.removeCard(player.game(), 'encounter');
        if(data.getPlayer(player.game(), player.name()).traveller === 'umegae') {
            data.setPlayer(player.game(), player.name(), 'coins', data.getPlayer(player.game(), player.name()).coins + 1);
        }
        data.giveCard(player.game(), player.name(), ...c);
        updateData(player.game());
        sendEvent('cards', {
            cards: [{name: c, type: 'encounter'}],
            take: true,
            name: player.name()
        });
        res(c);
    });
    socket.on('request:encounters', (x, res) => {
        const c = data.getCard(player.game(), 'encounter', 0, 2);
        sendEvent('cards', {
            cards: [{name: c[0], type: 'encounter'},
                    {name: c[1], type: 'encounter'}],
            hide: true
        });
        res(c);
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
        sendEvent('choose', {
            cards: [which],
            name: player.name()
        });
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
        let ach;
        if(['paddy3', 'mountain4', 'sea5'].indexOf(`${type}${n}`) !== -1) {
            if(data.removeCard(player.game(), 'achievement', `ac-${type}`).length) {
                ach = `ac-${type}`;
                data.giveCard(player.game(), player.name(), ach);
            }
        }
        updateData(player.game());
        sendEvent('cards', {
            cards: [{name: `${type}${n}`, type: `${type} panorama`}],
            take: true,
            name: player.name()
        });
        if(ach) {
            setTimeout(() => {
                sendEvent('cards', {
                    cards: [{name: ach, type: `achievement-blue`}],
                    take: true,
                    name: player.name()
                });
            }, 1600);
        }
        res([`${type}${n}`, ach]);
    });
    socket.on('request:souvenirs', (x, res) => {
        const c = data.getCard(player.game(), 'souvenir', 0, 3);
        sendEvent('cards', {
            cards: [{name: c[0], type: `souvenir`},
                    {name: c[1], type: `souvenir`},
                    {name: c[2], type: `souvenir`}]
        });
        res(c);
    });
    socket.on('submit:souvenirs', ([souvenirs, which], res) => {
        let min = 3;
        if(souvenirs.length) {
            const price = souvenirs
                            .map((name) => {
                                const p = cards.get(name).price;
                                min = Math.min(min, p);
                                return p - (name === which ? 1 : 0);
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
            let discount = 0;
            if(souvenirs.length >= 2 && data.getPlayer(player.game(), player.name()).traveller === 'sasayakko') {
                //Sasayakko does not pay for the cheapest souvenir
                discount = min;
            } else if(data.getPlayer(player.game(), player.name()).traveller === 'zen-emon') {
                //Zen-emon pays only 1 coin for one of the souvenirs
                discount = cards.get(which).price - 1;
            }
            data.setPlayer(player.game(), player.name(), 'coins', coins + discount);
            sendEvent('choose', {
                cards: souvenirs,
                name: player.name(),
                coins: -price + discount
            });
        }
        updateData(player.game());
        res();
    });
    socket.on('acquire:souvenir', (x, res) => {
        const card = data.removeCard(player.game(), 'souvenir');
        data.giveCard(player.game(), player.name(), ...card);
        updateData(player.game());
        sendEvent('cards', {
            cards: [{name: card, type: `souvenir`}],
            take: true,
            name: player.name()
        });
        res(card);
    });
    socket.on('request:meals', ([first, extra], res) => {
        if(first) {
            data.set(player.game(), 'mealset', data.removeCard(player.game(), 'meal', data.players(player.game(), true) + 1));
        }
        let c = [];
        for(let card of data.get(player.game()).mealset) {
            c = [...c, {name: card, type: 'meal'}];
        }
        updateData(player.game());
        if(!extra) {
            sendEvent('cards', {
                cards: c,
                hide: true,
                firstMeal: first
            });
        }
        res(data.get(player.game()).mealset);
    });
    socket.on('discard:meal', (x, res) => {
        data.discardMeal(player.game(), data.get(player.game()).mealset[Math.floor(Math.random() * data.get(player.game()).mealset.length)]);
        updateData(player.game());
        res();
    });
    socket.on('submit:meal', ([which, special], res) => {
        if(which !== null) {
            const price = cards.get(which).price - (data.getPlayer(player.game(), player.name()).traveller === 'kinko' ? 1 : 0);
            const {coins} = data.getPlayer(player.game(), player.name());
            if(price <= coins || special === 'satsuki') {
                if(special !== 'eriku') {
                    data.discardMeal(player.game(), which);
                }
                data.giveCard(player.game(), player.name(), which);
                if(special !== 'satsuki') {
                    data.setPlayer(player.game(), player.name(), 'coins', coins - price);
                }
                sendEvent('choose', {
                    cards: [which],
                    coins: special === 'satsuki' ? 0 : -price,
                    name: player.name()
                });
            } else {
                return res('You can\'t afford this meal');
            }
        } else {
            sendEvent('clear', {});
        }
        updateData(player.game());
        res();
    });
    socket.on('request:eriku_meal', (x, res) => {
        const c = data.getCard(player.game(), 'meal');
        sendEvent('cards', {
            cards: [{name: c, type: 'meal'}],
            hide: true,
            name: player.name()
        });
        res(c);
    });
    socket.on('donate', ([amt, free], res) => {
        const {coins, donations} = data.getPlayer(player.game(), player.name());
        if(free || coins >= amt) {
            data.setPlayer(player.game(), player.name(), 'donations', donations + amt);
            if(!free) {
                data.setPlayer(player.game(), player.name(), 'coins', coins - amt);
                sendEvent('coins', {
                    coins: - amt,
                    name: player.name()
                });
            }
            updateData(player.game());
        }
        res();
    });
    const calculateAchievements = () => {
        const c = {}, ret = {};
        const max = {
            spring: 0,
            encounter: 0,
            souvenir: 0,
            meal: 0
        };
        for(let p of data.iPlayers(player.game())) {
            c[p.name] = {
                spring: 0,
                encounter: 0,
                souvenir: 0,
                meal: 0
            };
            ret[p.name] = [];
            for(let card of p.cards) {
                switch(cards.get(card).type) {
                    case 'spring':
                    case 'encounter':
                    case 'souvenir':
                        c[p.name][cards.get(card).type]++;
                        break;
                    case 'meal':
                        c[p.name].meal += cards.get(card).price;
                        break;
                }
            }
            if(c[p.name].spring > max.spring) {
                max.spring = c[p.name].spring;
            }
            if(c[p.name].encounter > max.encounter) {
                max.encounter = c[p.name].encounter;
            }
            if(c[p.name].souvenir > max.souvenir) {
                max.souvenir = c[p.name].souvenir;
            }
            if(c[p.name].meal > max.meal) {
                max.meal = c[p.name].meal;
            }
        }
        for(let p of data.iPlayers(player.game())) {
            if(c[p.name].spring === max.spring) {
                ret[p.name].push('bather');
            }
            if(c[p.name].encounter === max.encounter) {
                ret[p.name].push('chatterbox');
            }
            if(c[p.name].souvenir === max.souvenir) {
                ret[p.name].push('collector');
            }
            if(c[p.name].meal === max.meal) {
                ret[p.name].push('gourmet');
            }
        }
        return ret;
    };
    socket.on('request:achievements', (x, res) => {
        const ret = calculateAchievements();
        res(ret);
    });
    socket.on('request:final-score', (x, res) => {
        const cards = calculateAchievements();
        data.giveCard(player.game(), player.name(), ...cards[player.name()]);
        res();
    });
};