'use strict';
import {board, spaceType} from './board.es6';
import * as data from './data.es6';
import {socket} from './socket.es6';
import {default as $} from 'jquery';
import {
    PLAY, DONE, SOUVENIR_PILE_X, ENCOUNTER_PILE_X, SPRINGS_PILE_X, MEAL_PILE_X, MEALSET_PILE_X,
    PADDY_PILE_X, MOUNTAIN_PILE_X, SEA_PILE_X, PILE_Y, PANO_PILE_Y, PILE_WIDTH, CARD_WIDTH, CARD_HEIGHT
} from './const.es6';
import * as action from './action.es6';
import {activate, deactivate, windowRelPos, currentZoom} from './board_scroll.es6';
import * as cards from '../../../cards/index.es6';
import * as card from './cards.es6';
import {instruct} from './notification.es6';

export let runner = function*(runner) {
    socket.on('game:event', ([which, d]) => {
        let run = function*() {
            switch(which) {
                case 'coins':
                    card.coin(d.coins, d.name);
                    break;
                case 'cards':
                    let $cards = [];
                    for(let {name, type} of d.cards) {
                        const [startX, startY] = windowRelPos(...({
                            'souvenir': [SOUVENIR_PILE_X, PILE_Y],
                            'encounter': [ENCOUNTER_PILE_X, PILE_Y],
                            'springs': [SPRINGS_PILE_X, PILE_Y],
                            'meal': [(d.firstMeal === true) ? MEAL_PILE_X : MEALSET_PILE_X, PILE_Y],
                            'paddy panorama': [PADDY_PILE_X, PANO_PILE_Y],
                            'mountain panorama': [MOUNTAIN_PILE_X, PANO_PILE_Y],
                            'sea panorama': [SEA_PILE_X, PANO_PILE_Y],
                            'achievement-blue': [window.innerWidth / 2, - window.innerHeight / 2],
                            'achievement-gold': [window.innerWidth / 2, - window.innerHeight / 2]
                        })[type]);
                        $cards = [...$cards, card.create({
                            name: name,
                            type: type,
                            transform: `translate(${startX}px, ${startY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`
                        })];
                    }
                    card.show(...$cards);
                    yield window.setTimeout(() => run.next(), 400);
                    $cards.forEach(($card, i) => {
                        const w = (window.innerWidth - 50) / $cards.length;
                        const [scale, xx, rot] = [
                            Math.min(1, w / (CARD_WIDTH + 50)),
                            window.innerWidth / 2 + (i - (($cards.length - 1) / 2)) * Math.min(CARD_WIDTH + 50, w),
                            d.hide ? 180 : 0
                        ];
                        $card.css('transform', `translate(${xx}px, ${window.innerHeight / 2}px) scale(${scale}) rotateY(${rot}deg)`);
                    });
                    if(d.take) {
                        yield window.setTimeout(() => run.next(), 1200);
                        $cards.forEach(($card, i) => {
                            const [endX, endY] =
                                [   $(`.card-tray[name="${d.name}"] .handle`).position().left + window.innerWidth / 100 * 9,
                                    window.innerHeight / 2 * 3];
                            $card.css('transform', `translate(${endX}px, ${endY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`);
                            window.setTimeout(() => $card.remove(), 700);
                        });
                        return;
                    }
                    socket.once('game:event', ([which, d]) => run.next([which, d]));
                    const [evt, d2] = yield;
                    switch(evt) {
                        case 'clear':
                            $cards.forEach(($card, i) => {
                                const [endX, endY] = windowRelPos(...({
                                    'card souvenir': [SOUVENIR_PILE_X, PILE_Y],
                                    'card encounter': [ENCOUNTER_PILE_X, PILE_Y],
                                    'card meal': [MEALSET_PILE_X, PILE_Y]
                                })[$card.attr('class')]);
                                $card.css('transform', `translate(${endX}px, ${endY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`);
                                window.setTimeout(() => $card.remove(), 700);
                            });
                            break;
                        case 'choose':
                            if(d2.coins) {
                                card.coin(d2.coins, d2.name);
                            }
                            $cards.forEach(($card, i) => {
                                const [endX, endY] = d2.cards.indexOf($card.attr('name')) === -1 ?  windowRelPos(...({
                                        'card souvenir': [SOUVENIR_PILE_X, PILE_Y],
                                        'card encounter': [ENCOUNTER_PILE_X, PILE_Y],
                                        'card meal': [MEALSET_PILE_X, PILE_Y]
                                    })[$card.attr('class')]) :
                                    [   $(`.card-tray[name="${d2.name}"] .handle`).position().left + window.innerWidth / 100 * 9,
                                        window.innerHeight / 2 * 3];
                                const rot = d2.cards.indexOf($card.attr('name')) === -1 ? 180 : 0;
                                $card.css('transform', `translate(${endX}px, ${endY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`);
                                window.setTimeout(() => $card.remove(), 700);
                            });
                            break;
                    }
                    break;
            }
        }();
        run.next();
    });
    while(data.get().state === PLAY) {
        //Determine the turn
        const order = data.playerOrder();
        // Player in the lead moves the extra
        if(data.players() === 2) {
            if(data.get().extra.position[0] <= order[0].position[0]) {
                if(data.get().extra.position[0] < order[0].position[0] || data.get().extra.position[1] > order[0].position[1]) {
                    if(order[1].name === data.me().name) {
                        const space = yield* action.move(runner, 'extra');
                        yield socket.emit('turn:move', ['extra', space], () => runner.next());
                        if(board[space[0]] instanceof spaceType.Inn) {
                            yield socket.emit('request:meals', [space[1] === 0, true], () => runner.next());
                            yield socket.emit('discard:meal', null, () => runner.next());
                        }
                        socket.emit('turn:end');
                    }
                    yield socket.once('turn:end', () => runner.next());
                    continue;
                }
            }
        }
        if(order[0].name === data.me().name) {
            const space = yield* action.move(runner, data.me().name);
            yield socket.emit('turn:move', [data.me().name, space], () => runner.next());
            deactivate();
            if(board[space[0]] instanceof spaceType.Inn && cards.get(data.me().traveller).atInn) {
                let received = yield* cards.get(data.me().traveller).atInn(runner, socket, data.me(), card, instruct);
                let effect;
                while(!!(effect = received.splice(0, 1)[0])) {
                    const type = cards.get(effect).type;
                    const [xx, yy] = [{
                            'souvenir': SOUVENIR_PILE_X,
                            'encounter': ENCOUNTER_PILE_X,
                            'panorama paddy': PADDY_PILE_X,
                            'panorama mountain': MOUNTAIN_PILE_X,
                            'panorama sea': SEA_PILE_X,
                            'achievement': window.innerWidth / 2
                        }[type],
                        type.indexOf('panorama') === -1 ? (type === 'achievement' ? -window.innerHeight / 2 : PILE_Y) : PANO_PILE_Y
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
                    if(type === 'encounter') {
                        received.push(...yield* cards.get(effect).draw(runner, socket, data.me(), card, instruct));
                    } else {
                        effect = null;
                    }
                }
            }
            yield* board[space[0]].land(runner);
            activate();
            socket.emit('turn:end');
        }
        yield socket.once('turn:end', () => runner.next());
        let done = true;
        for(let i of data.iPlayers()) {
            if(i.position[0] !== board.length - 1) {
                done = false;
            }
        }
        if(!done) { continue; }
        socket.emit('game:ready', DONE);
    }
};