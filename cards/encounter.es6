'use strict';
require('babel/polyfill');
let $ = require('jquery');
const CARD_WIDTH = 300;
const CARD_HEIGHT = 461;

module.exports = {
    'shokunin': {
        name: 'Shokunin',
        type: 'encounter',
        score(player) {
            return player.traveller === 'umegae' ? 1 : 0;
        },
        *draw(runner, socket) {
            //Receive one Souvenir
            return yield socket.emit('acquire:souvenir', null, (s) => runner.next(s));
        }
    },
    'annaibito-p': {
        name: 'Annaibito',
        type: 'encounter',
        score(player) {
            return player.traveller === 'umegae' ? 1 : 0;
        },
        *draw(runner, socket, player, card) {
            //Receive one Paddy Panorama
            let which = 'paddy';
            if(player.cards.indexOf('paddy3') !== -1) {
                let opts = [];
                if(player.cards.indexOf('mountain4') === -1) {
                    opts.push('mountain');
                }
                if(player.cards.indexOf('sea5') === -1) {
                    opts.push('sea');
                }
                if(opts.length === 1) {
                    which = opts[0];
                } else {
                    const $cards = [
                        card.create({
                            name: opts[0],
                            type: `panorama ${opts[0]}`,
                            transform: `translate(${window.innerWidth / 2 - CARD_WIDTH - 25}px, ${-window.innerHeight / 2}px) scale(1) rotateY(180deg)`,
                            click: card.selectOne
                        }),
                        card.create({
                            name: opts[1],
                            type: `panorama ${opts[1]}`,
                            transform: `translate(${window.innerWidth / 2 + 25}px, ${-window.innerHeight / 2}px) scale(1) rotateY(180deg)`,
                            click: card.selectOne
                        })
                    ];
                    card.show(...$cards);
                    yield window.setTimeout(() => runner.next(), 400);
                    $cards.forEach(($card, i) => {
                        $card.css('transform', `translate(${(window.innerWidth / 2) - (i - 1/2) * (CARD_WIDTH + 50)}px, ${window.innerHeight / 2}px) scale(1) rotateY(180deg)`);
                    });
                    const $chosen = yield card.confirm(($s) => {
                        return $s.length === 1;
                    }, (c) => runner.next(c));
                    $cards.forEach(($card, i) => {
                        $card.css('transform', `translate(${(window.innerWidth / 2) - (i - 1/2) * (CARD_WIDTH + 50)}px, ${-window.innerHeight / 2}px) scale(1) rotateY(180deg)`);
                        window.setTimeout(() => $card.remove(), 700);
                    });
                    which = $chosen.attr('name');
                }
            }
            return yield socket.emit('acquire:panorama', which, (p) => runner.next(p));
        }
    },
    'annaibito-m': {
        name: 'Annaibito',
        type: 'encounter',
        score(player) {
            return player.traveller === 'umegae' ? 1 : 0;
        },
        *draw(runner, socket, player, card) {
            //Receive one Mountain Panorama
            let which = 'mountain';
            if(player.cards.indexOf('mountain4') !== -1) {
                let opts = [];
                if(player.cards.indexOf('paddy3') === -1) {
                    opts.push('paddy');
                }
                if(player.cards.indexOf('sea5') === -1) {
                    opts.push('sea');
                }
                if(opts.length === 1) {
                    which = opts[0];
                } else {
                    const $cards = [
                        card.create({
                            name: opts[0],
                            type: `panorama ${opts[0]}`,
                            transform: `translate(${window.innerWidth / 2 - CARD_WIDTH - 25}px, ${-window.innerHeight / 2}px) scale(1) rotateY(180deg)`,
                            click: card.selectOne
                        }),
                        card.create({
                            name: opts[1],
                            type: `panorama ${opts[1]}`,
                            transform: `translate(${window.innerWidth / 2 + 25}px, ${-window.innerHeight / 2}px) scale(1) rotateY(180deg)`,
                            click: card.selectOne
                        })
                    ];
                    card.show(...$cards);
                    yield window.setTimeout(() => runner.next(), 400);
                    $cards.forEach(($card, i) => {
                        $card.css('transform', `translate(${(window.innerWidth / 2) - (i - 1/2) * (CARD_WIDTH + 50)}px, ${window.innerHeight / 2}px) scale(1) rotateY(180deg)`);
                    });
                    const $chosen = yield card.confirm(($s) => {
                        return $s.length === 1;
                    }, (c) => runner.next(c));
                    $cards.forEach(($card, i) => {
                        $card.css('transform', `translate(${(window.innerWidth / 2) - (i - 1/2) * (CARD_WIDTH + 50)}px, ${-window.innerHeight / 2}px) scale(1) rotateY(180deg)`);
                        window.setTimeout(() => $card.remove(), 700);
                    });
                    which = $chosen.attr('name');
                }
            }
            return yield socket.emit('acquire:panorama', which, (p) => runner.next(p));
        }
    },
    'annaibito-s': {
        name: 'Annaibito',
        type: 'encounter',
        score(player) {
            return player.traveller === 'umegae' ? 1 : 0;
        },
        *draw(runner, socket, player, card) {
            //Receive one Sea Panorama
            let which = 'sea';
            if(player.cards.indexOf('sea5') !== -1) {
                let opts = [];
                if(player.cards.indexOf('paddy3') === -1) {
                    opts.push('paddy');
                }
                if(player.cards.indexOf('mountain4') === -1) {
                    opts.push('mountain');
                }
                if(opts.length === 1) {
                    which = opts[0];
                } else {
                    const $cards = [
                        card.create({
                            name: opts[0],
                            type: `panorama ${opts[0]}`,
                            transform: `translate(${window.innerWidth / 2 - CARD_WIDTH - 25}px, ${-window.innerHeight / 2}px) scale(1) rotateY(180deg)`,
                            click: card.selectOne
                        }),
                        card.create({
                            name: opts[1],
                            type: `panorama ${opts[1]}`,
                            transform: `translate(${window.innerWidth / 2 + 25}px, ${-window.innerHeight / 2}px) scale(1) rotateY(180deg)`,
                            click: card.selectOne
                        })
                    ];
                    card.show(...$cards);
                    yield window.setTimeout(() => runner.next(), 400);
                    $cards.forEach(($card, i) => {
                        $card.css('transform', `translate(${(window.innerWidth / 2) - (i - 1/2) * (CARD_WIDTH + 50)}px, ${window.innerHeight / 2}px) scale(1) rotateY(180deg)`);
                    });
                    const $chosen = yield card.confirm(($s) => {
                        return $s.length === 1;
                    }, (c) => runner.next(c));
                    $cards.forEach(($card, i) => {
                        $card.css('transform', `translate(${(window.innerWidth / 2) - (i - 1/2) * (CARD_WIDTH + 50)}px, ${-window.innerHeight / 2}px) scale(1) rotateY(180deg)`);
                        window.setTimeout(() => $card.remove(), 700);
                    });
                    which = $chosen.attr('name');
                }
            }
            return yield socket.emit('acquire:panorama', which, (p) => runner.next(p));
        }
    },
    'samurai': {
        name: 'Samurai',
        type: 'encounter',
        score(player) {
            return 3 + (player.traveller === 'umegae' ? 1 : 0);
        },
        *draw(runner) {
            //Worth 3 points
            yield window.setTimeout(() => runner.next(), 0);
            return [null];
        }
    },
    'kuge': {
        name: 'Kuge',
        type: 'encounter',
        score(player) {
            return player.traveller === 'umegae' ? 1 : 0;
        },
        *draw(runner, socket, player, card) {
            //Receive 3 coins
            yield socket.emit('acquire:coins', 3, () => runner.next());
            card.coin(3);
            return [null];
        }
    },
    'miko': {
        name: 'Miko',
        type: 'encounter',
        score(player) {
            return player.traveller === 'umegae' ? 1 : 0;
        },
        *draw(runner, socket) {
            //Donate 1 coin to the Temple from the reserve
            yield socket.emit('donate', [1, true], () => runner.next());
            return [null];
        }
    }
};