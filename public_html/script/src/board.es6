'use strict';
require('babel/polyfill');
import {default as $} from 'jquery';

import {socket} from './socket.es6';
import * as cards from '../../../cards/index.es6';
import * as card from './cards.es6';
import {me as my} from './data.es6';
import {error} from './notification.es6';
import {currentZoom, windowRelPos} from './board_scroll.es6';

import {
    SPRINGS_PILE_X, SOUVENIR_PILE_X, ENCOUNTER_PILE_X, MEAL_PILE_X, MEALSET_PILE_X,
    PADDY_PILE_X, MOUNTAIN_PILE_X, SEA_PILE_X, PILE_Y, PANO_PILE_Y, PILE_WIDTH,
    CARD_WIDTH, CARD_HEIGHT
} from './const.es6';

const [UP, DOWN] = [-1, 1];

class Space {
    constructor(x, y, dir = UP, len = 1, spa = 88) {
        [this.x, this.y, this.direction, this.length, this.spacing] = [x, y, dir, len, spa];
    }
    //Continue by default
    *land(runner) { yield window.setTimeout(() => runner.next(), 0); }
}

class Inn extends Space {
    constructor(...args) { super(...args, 67); }
    *land(runner) {
        if(my().traveller === 'eriku') {
            const meal = yield socket.emit('request:eriku_meal', (meal) => runner.next(meal));
            const [startX, startY] = windowRelPos(MEAL_PILE_X,  PILE_Y);
            let $card = card.create({
                name: meal,
                type: 'meal',
                click: card.select,
                transform: `translate(${startX}px, ${startY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`
            });
            card.show($card);
            yield window.setTimeout(() => runner.next(), 400);
            $card.css('transform', `translate(${window.innerWidth / 2}px, ${window.innerHeight / 2}px) scale(${1}) rotateY(0)`);
            const $chosen = yield card.confirm(($s) => {
                let [price, discount] = [0, 0];
                if($s.length === 1) {
                    price += cards.get($s.attr('name')).price;
                }
                if(my().traveller === 'kinko') {
                    discount = 1;
                }
                if(price - discount > my().coins) { return error('You can\'t afford that meal'); }
                if(my().cards.indexOf($.attr('name')) !== -1) { return error('You have already eaten this meal'); }
                return true;
            }, (c) => runner.next(c));
            if($chosen.length) {
                const e = yield socket.emit('submit:meal', [$chosen.attr('name'), 'eriku'], (e) => runner.next(e));
                if(e !== undefined) {
                    error(e);
                } else {
                    return;
                }
            }
        }
        const first = my().position[1] === 0;
        const meals = yield socket.emit('request:meals', first, (meals) => runner.next(meals));
        let $cards = [];
        const [startX, startY] = windowRelPos(first ? MEAL_PILE_X : MEALSET_PILE_X, PILE_Y);
        for(let meal of meals) {
            $cards = [
                card.create({
                    name: meal,
                    type: 'meal',
                    click: card.selectOne,
                    transform: `translate(${startX}px, ${startY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`
                }), ...$cards
            ];
        }
        if(my().traveller === 'satsuki') {
            const meal = meals[Math.floor(Math.random() * meals.length)];
            let $card = card.create({
                name: meal,
                type: 'meal',
                click: card.select,
                transform: `translate(${startX}px, ${startY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`
            });
            card.show($card);
            yield window.setTimeout(() => runner.next(), 400);
            $card.css('transform', `translate(${window.innerWidth / 2}px, ${window.innerHeight / 2}px) scale(${1}) rotateY(0)`);
            const $chosen = yield card.confirm(($s) => {
                if(my().cards.indexOf($.attr('name')) !== -1) { return error('You have already eaten this meal'); }
                return true;
            }, (c) => runner.next(c));
            if($chosen.length) {
                return yield socket.emit('submit:meal', [$chosen.attr('name'), 'satsuki'], () => runner.next());
            }
        }
        card.show(...$cards);
        yield window.setTimeout(() => runner.next(), 400);
        $cards.forEach(($card, i) => {
            const w = (window.innerWidth - 50) / $cards.length;
            const [scale, xx] = [
                Math.min(1, w / (CARD_WIDTH + 50)),
                window.innerWidth / 2 + (i - (($cards.length - 1) / 2)) * Math.min(CARD_WIDTH + 50, w)
            ];
            $card.css('transform', `translate(${xx}px, ${window.innerHeight / 2}px) scale(${scale}) rotateY(0)`);
        });
        const $chosen = yield card.confirm(($s) => {
            let [price, discount] = [0, 0];
            if($s.length === 1) {
                price += cards.get($s.attr('name')).price;
            }
            if(my().traveller === 'kinko') {
                discount = 1;
            }
            if(price - discount > my().coins) { return error('You can\'t afford that meal'); }
            if(my().cards.indexOf($.attr('name')) !== -1) { return error('You have already eaten this meal'); }
            return true;
        }, (c) => runner.next(c));
        $cards.forEach(($card) => {
            if($chosen.toArray().map((c) => $(c).attr('name')).indexOf($card.attr('name')) === -1) {
                $card.css('transform', `translate(${startX}px, ${startY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`);
                window.setTimeout(() => $card.remove(), 700);
            }
        });
        if($chosen.length) {
            const [price, discount] = [
                cards.get($chosen.attr('name')).price,
                (my().traveller.name === 'kinko' ? 1 : 0)
            ];
            card.coin(- price + discount);
            $chosen.each(function() {
                $(this).css('transform', `translate(${window.innerWidth / 10}px, ${window.innerHeight + CARD_HEIGHT}px)`);
                window.setTimeout(() => $(this).remove(), 700);
            });
            const e = yield socket.emit('submit:meal', [$chosen.attr('name')], (e) => runner.next(e));
            if(e !== undefined) {
                error(e);
            }
        } else {
            yield socket.emit('submit:meal', [null], () => runner.next());
        }
    }
}
class Village extends Space {
    *land(runner) {
        const souvenirs = yield socket.emit('request:souvenirs', null, (souvenirs) => runner.next(souvenirs));
        const [startX, startY] = windowRelPos(SOUVENIR_PILE_X, PILE_Y);
        let $cards = [
            card.create({
                name: souvenirs[0],
                type: 'souvenir',
                click: card.select,
                transform: `translate(${startX}px, ${startY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`
            }),
            card.create({
                name: souvenirs[1],
                type: 'souvenir',
                click: card.select,
                transform: `translate(${startX}px, ${startY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`
            }),
            card.create({
                name: souvenirs[2],
                type: 'souvenir',
                click: card.select,
                transform: `translate(${startX}px, ${startY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`,
            })
        ];
        card.show(...$cards);
        yield window.setTimeout(() => runner.next(), 400);
        $cards.forEach(($card, i) => {
            $card.css('transform', `translate(${window.innerWidth / 2 - (CARD_WIDTH + 50) * (1 - i)}px, ${window.innerHeight / 2}px) scale(1) rotateY(0)`);
        });
        let which, min = 3, max = 0, price;
        const $chosen = yield card.confirm(($s) => {
            price = $s.toArray()
                .map((el) => {
                    const p = cards.get($(el).attr('name')).price;
                    max = Math.max(max, p);
                    min = Math.min(min, p);
                    return p;
                })
                .reduce((p, c) => p + c, 0);
            let discount = 0;
            if(my().traveller === 'zen-emon') {
                discount = (max - 1);
            }
            if(price - discount > my().coins) { return error('You can\'t afford all that'); }
            return true;
        }, (c) => runner.next(c));
        $cards.forEach(($card) => {
            if($chosen.toArray().map((c) => $(c).attr('name')).indexOf($card.attr('name')) === -1) {
                $card.css('transform', `translate(${startX}px, ${startY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`);
                window.setTimeout(() => $card.remove(), 700);
            }
        });
        let discount = 0;
        if(my().traveller === 'zen-emon') {
            $chosen.click(card.chooseOne);
            [which] = yield card.confirm(($s) => $s.length === 1, (w) => runner.next(w));
            discount = card.get(which.attr('name')).price - 1;
        } else if($cards.length >= 2 && my().traveller === 'sasayakko') {
            discount = min;
        }
        card.coin(- price + discount);
        $chosen.each(function() {
            $(this).css('transform', `translate(${window.innerWidth / 10}px, ${window.innerHeight + CARD_HEIGHT}px)`);
            window.setTimeout(() => $(this).remove(), 700);
        });
        const e = yield socket.emit('submit:souvenirs', [$chosen.toArray().map((c) => $(c).attr('name')), which], (e) => runner.next(e));
        if(e !== undefined) {
            error(e);
        }
    }
}
class Temple extends Space {}
class Encounter extends Space {
    *land(runner) {
        const [startX, startY] = windowRelPos(ENCOUNTER_PILE_X, PILE_Y);
        let e = null;
        if(my().traveller === 'yoshiyasu') {
            const encounters = yield socket.emit('request:encounters', null, (c) => runner.next(c));
            const $cards = [
                card.create({
                    name: encounters[0],
                    type: 'encounter',
                    transform: `translate(${startX}px, ${startY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`,
                    click: card.selectOne
                }),
                card.create({
                    name: encounters[1],
                    type: 'encounter',
                    transform: `translate(${startX}px, ${startY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`,
                    click: card.selectOne
                })
            ];
            card.show(...$cards);
            yield window.setTimeout(() => runner.next(), 400);
            $cards.forEach(($card, i) => {
                $card.css('transform', `translate(${(window.innerWidth - CARD_WIDTH - 50) / 2 + (CARD_WIDTH + 25) * i}px, ${window.innerHeight / 2}px) scale(1) rotateY(0)`);
            });
            const $chosen = yield card.confirm(($s) => {
                return $s.length === 1;
            }, (c) => runner.next(c));
            $cards.forEach(($card) => {
                if($chosen.attr('name') !== $card.attr('name')) {
                    $card.css('transform', `translate(${startX}px, ${startY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`);
                } else {
                    $card.css('transform', `translate(${window.innerWidth / 10}px, ${window.innerHeight + CARD_HEIGHT}px)`);
                }
                window.setTimeout(() => $card.remove(), 700);
            });
            e = $chosen.attr('name');
            yield socket.emit('submit:encounter', e, () => runner.next());
        } else {
            [e] = yield socket.emit('acquire:encounter', null, (e) => runner.next(e));
            let $card = card.create({
                name: e,
                type: 'encounter',
                transform: `translate(${startX}px, ${startY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`
            });
            card.show([$card]);
            yield window.setTimeout(() => runner.next(), 400);
            $card.css('transform', `translate(${window.innerWidth / 2}px, ${window.innerHeight / 2}px) scale(1) rotateY(0)`);
            // Umegae gets a coin for each Encounter
            if(my().traveller === 'umegae') { card.coin(1); }
            yield window.setTimeout(() => {
                $card.css('transform', `translate(${window.innerWidth / 10}px, ${window.innerHeight + CARD_HEIGHT}px)`);
                runner.next();
            }, 1500);
            yield window.setTimeout(() => {
                $card.remove();
                runner.next();
            }, 700);
        }
        const [effect] = yield* cards.get(e).draw(runner, socket, my(), card);
        if(effect) {
            const type = cards.get(effect).type;
            const [xx, yy] = [{
                    'souvenir': SOUVENIR_PILE_X,
                    'panorama paddy': PADDY_PILE_X,
                    'panorama mountain': MOUNTAIN_PILE_X,
                    'panorama sea': SEA_PILE_X
                }[type],
                type.indexOf('panorama') === -1 ? PILE_Y : PANO_PILE_Y
            ];
            const [startX, startY] = windowRelPos(xx, yy);
            let $card = card.create({
                name: effect,
                type: type,
                transform: `translate(${startX}px, ${startY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`
            });
            card.show([$card]);
            yield window.setTimeout(() => runner.next(), 400);
            $card.css('transform', `translate(${window.innerWidth / 2}px, ${window.innerHeight / 2}px) scale(1) rotateY(0)`);
            yield window.setTimeout(() => {
                $card.css('transform', `translate(${window.innerWidth / 10}px, ${window.innerHeight + CARD_HEIGHT}px)`);
                runner.next();
            }, 1500);
            yield window.setTimeout(() => {
                $card.remove();
                runner.next();
            }, 700);
        }
    }
}
class Panorama extends Space {
    constructor(x, y, type, dir, len) {
        super(x,y,dir,len);
        this.type = type;
    }
    *land(runner) {
        const [p] = yield socket.emit('acquire:panorama', this.type, (p) => runner.next(p));
        if(p.substr(0, this.type.length) !== this.type) { return error(p); }
        const xx = {paddy:PADDY_PILE_X,mountain:MOUNTAIN_PILE_X,sea:SEA_PILE_X}[this.type];
        const [startX, startY] = windowRelPos({paddy:PADDY_PILE_X,mountain:MOUNTAIN_PILE_X,sea:SEA_PILE_X}[this.type], PANO_PILE_Y);
        let $card = card.create({
            name: p,
            type: 'panorama',
            transform: `translate(${startX}px, ${startY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`
        });
        card.show([$card]);
        yield window.setTimeout(() => runner.next(), 400);
        $card.css('transform', `translate(${window.innerWidth / 2}px, ${window.innerHeight / 2}px) scale(1) rotateY(0)`);
        // Gotozaemon gets a coin for each Panorama
        if(my().traveller === 'gotozaemon') { card.coin(1); }
        yield window.setTimeout(() => {
            $card.css('transform', `translate(${window.innerWidth / 10}px, ${window.innerHeight + CARD_HEIGHT}px)`);
            runner.next();
        }, 1500);
        yield window.setTimeout(() => {
            $card.remove();
            runner.next();
        }, 700);
    }
}
class Spring extends Space {
    *land(runner) {
        const [s] = yield socket.emit('acquire:spring', null, (s) => runner.next(s));
        const [startX, startY] = windowRelPos(SPRINGS_PILE_X, PILE_Y);
        let $card = card.create({
            name: s,
            type: 'springs',
            transform: `translate(${startX}px, ${startY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`
        });
        card.show([$card]);
        yield window.setTimeout(() => runner.next(), 400);
        $card.css('transform', `translate(${window.innerWidth / 2}px, ${window.innerHeight / 2}px) scale(1) rotateY(0)`);
        yield window.setTimeout(() => {
            $card.css('transform', `translate(${window.innerWidth / 10}px, ${window.innerHeight + CARD_HEIGHT}px)`);
            runner.next();
        }, 1500);
        yield window.setTimeout(() => {
            $card.remove();
            runner.next();
        }, 700);
    }
}
class Farm extends Space {
    *land(runner) {
        yield socket.emit('acquire:coins', 3, () => runner.next());
        card.coin(3);
    }
}

export let board = [
    new Inn(169, 706, DOWN, 5),
    new Village(256, 624, UP, 2),
    new Temple(314, 621, DOWN),
    new Encounter(378, 588),
    new Panorama(447, 593, 'paddy', DOWN),
    new Spring(525, 630, UP, 2),
    new Panorama(594, 657, 'mountain', DOWN, 2),
    new Farm(661, 698, UP, 2),
    new Village(720, 750, DOWN, 1),
    new Temple(794, 748, UP, 2),
    new Encounter(862, 702, DOWN),
    new Panorama(913, 653, 'sea', UP, 2),
    new Panorama(979, 564, 'mountain', DOWN),
    new Spring(1003, 502),
    new Inn(1087, 559, DOWN, 5),
    new Panorama(1178, 529, 'sea', DOWN),
    new Temple(1229, 561),
    new Farm(1285, 611, DOWN, 2),
    new Panorama(1342, 645, 'paddy', UP, 2),
    new Panorama(1399, 693, 'mountain', DOWN, 2),
    new Encounter(1469, 749, UP, 2),
    new Temple(1516, 797, DOWN),
    new Spring(1577, 876, UP, 2),
    new Panorama(1634, 898, 'mountain', DOWN),
    new Panorama(1692, 893, 'sea', UP, 2),
    new Village(1756, 893, DOWN),
    new Farm(1811, 877),
    new Inn(1909, 757, UP, 5),
    new Panorama(2001, 839, 'paddy', DOWN),
    new Village(2054, 826),
    new Encounter(2111, 826, DOWN, 2),
    new Farm(2172, 804),
    new Panorama(2232, 796, 'mountain', DOWN, 2),
    new Spring(2284, 768),
    new Panorama(2355, 711, 'sea', DOWN, 2),
    new Panorama(2403, 676, 'paddy'),
    new Temple(2460, 656, DOWN, 2),
    new Farm(2508, 624, UP, 2),
    new Encounter(2563, 577, DOWN),
    new Panorama(2609, 525, 'sea'),
    new Village(2667, 516, DOWN, 2),
    new Inn(2756, 402, UP, 5),
    new Spring(2847, 474),
    new Temple(2902, 459, DOWN, 2),
    new Encounter(2953, 424),
    new Village(3010, 394, DOWN, 2),
    new Panorama(3056, 358, 'sea'),
    new Farm(3115, 330, DOWN, 2),
    new Spring(3174, 294, UP, 2),
    new Encounter(3235, 288, DOWN),
    new Panorama(3294, 278, 'mountain'),
    new Panorama(3360, 291, 'paddy', DOWN, 2),
    new Panorama(3432, 283, 'sea', UP, 2),
    new Village(3505, 220, DOWN),
    new Inn(3606, 197, DOWN, 5)
];

const $board = $('#gameboard');
for(let i = 0; i < board.length; i++) {
    for(let j = 0; j < board[i].length; j++) {
        $board.append(
            $('<div></div>')
                .addClass('space')
                .attr('data-index', `${i}-${j}`)
                .css({
                    transform: `translate(${board[i].x}px, ${board[i].y + board[i].direction * j * board[i].spacing}px)`,
                    opacity: 0
                })
        );
    }
}

export let spaceType = {
    Inn: Inn,
    Village: Village,
    Spring: Spring,
    Encounter: Encounter,
    Farm: Farm,
    Temple: Temple,
    Panorama: Panorama,
};