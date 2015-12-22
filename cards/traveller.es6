'use strict';
import * as encounters from './encounter.es6';
const CARD_WIDTH = 300;
const CARD_HEIGHT = 461;

module.exports = {
    'hiroshige': {
        name: 'Hiroshige',
        type: 'traveller',
        coins: 3,
        *atInn(runner, socket, player, card, instruct) {
            //Choose a Panorama at an Inn
            let which = 'paddy', opts = [];
            if(player.cards.indexOf('paddy3') === -1) {
                opts.push('paddy');
            }
            if(player.cards.indexOf('mountain4') === -1) {
                opts.push('mountain');
            }
            if(player.cards.indexOf('sea5') === -1) {
                opts.push('sea');
            }
            if(opts.length === 0) {
                which = '';
            } else  if(opts.length === 1) {
                which = opts[0];
            } else {
                let [$cards, startX] = [[], []];
                opts.forEach((opt, i) => {
                    const xx = (window.innerWidth / 2) - (i - (opts.length - 1) / 2) * (CARD_WIDTH + 50);
                    startX.push(xx);
                    $cards = [
                        card.create({
                            name: opt,
                            type: `panorama ${opt}`,
                            transform: `translate(${xx}px, ${-window.innerHeight / 2}px) scale(1) rotateY(180deg)`,
                            click: card.selectOne
                        }),
                        ...$cards
                    ];
                });
                card.show(...$cards);
                yield window.setTimeout(() => runner.next(), 400);
                $cards.forEach(($card, i) => {
                    $card.css('transform', `translate(${startX[i]}px, ${window.innerHeight / 2}px) scale(1) rotateY(180deg)`);
                });
                instruct('Choose a panorama');
                const $chosen = yield card.confirm(($s) => {
                    return $s.length === 1;
                }, (c) => runner.next(c));
                instruct('');
                $cards.forEach(($card, i) => {
                    $card.css('transform', `translate(${startX[i]}px, ${-window.innerHeight / 2}px) scale(1) rotateY(180deg)`);
                    window.setTimeout(() => $card.remove(), 700);
                });
                which = $chosen.attr('name');
            }
            if(which !== '') {
                return yield socket.emit('acquire:panorama', which, (p) => runner.next(p));
            } else {
                return [];
            }
        }
    },
    'chuubei': {
        name: 'Chuubei',
        type: 'traveller',
        coins: 4,
        *atInn(runner, socket) {
            //Draw an Encounter at an Inn
            return yield socket.emit('acquire:encounter', null, (e) => runner.next(e));
        }
    },
    'kinko': {
        name: 'Kinko',
        type: 'traveller',
        coins: 7
    },
    'yoshiyasu': {
        name: 'Yoshiyasu',
        type: 'traveller',
        coins: 9
    },
    'satsuki': {
        name: 'Satsuki',
        type: 'traveller',
        coins: 2
    },
    'mitsukuni': {
        name: 'Mitsukuni',
        type: 'traveller',
        coins: 6
    },
    'sasayakko': {
        name: 'Sasayakko',
        type: 'traveller',
        coins: 5
    },
    'hirotada': {
        name: 'Hirotada',
        type: 'traveller',
        coins: 8
    },
    'umegae': {
        name: 'Umegae',
        type: 'traveller',
        coins: 5
    },
    'zen-emon': {
        name: 'Zen-emon',
        type: 'traveller',
        coins: 6
    },
    'jirocho': {
        name: 'Jirocho',
        type: 'traveller',
        coins: 5/*,
        *atInn: () => {
            //Bet 1 coin in the Gaming room at Inns

        }*/
    },
    'daigoro': {
        name: 'Daigoro',
        type: 'traveller',
        coins: 3,
        *atInn(runner, socket) {
            //Draw an Encounter at an Inn
            return yield socket.emit('acquire:souvenir', null, (e) => runner.next(e));
        }
    },
    'nampo': {
        name: 'Nampo',
        type: 'traveller',
        coins: 2
    },
    'gotozaemon': {
        name: 'Gotozaemon',
        type: 'traveller',
        coins: 0
    },
    'miyataka': {
        name: 'Miyataka',
        type: 'traveller',
        coins: 4,
        special: () => {
            //Donate and buy an Amulet card at the same time
        }
    },
    'kita': {
        name: 'Kita',
        type: 'traveller',
        coins: 4,
        special: () => {
            //Draw an Encounter and buy a Calligraphy card
        }
    },
    'eriku': {
        name: 'Eriku',
        type: 'traveller',
        coins: 5
    }
};