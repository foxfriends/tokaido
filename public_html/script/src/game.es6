'use strict';
import {board, spaceType} from './board.es6';
import * as data from './data.es6';
import {socket} from './socket.es6';
import {
    PLAY, SOUVENIR_PILE_X, ENCOUNTER_PILE_X, PADDY_PILE_X, MOUNTAIN_PILE_X,
    SEA_PILE_X, PILE_Y, PANO_PILE_Y, PILE_WIDTH, CARD_WIDTH, CARD_HEIGHT
} from './const.es6';
import * as action from './action.es6';
import * as evt from './event.es6';
import {activate, deactivate, windowRelPos, currentZoom} from './board_scroll.es6';
import * as cards from '../../../cards/index.es6';
import * as card from './cards.es6';

export let runner = function*(runner) {
    socket.on('game:event', ([which, d]) => {
        //evt[which](d);
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
                            yield socket.emit('request:meals', space[1] === 0, () => runner.next());
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
                let [effect] = yield* cards.get(data.me().traveller).atInn(runner, socket, data.me(), card);
                while(effect !== null) {
                    const type = cards.get(effect).type;
                    const [xx, yy] = [{
                            'souvenir': SOUVENIR_PILE_X,
                            'encounter': ENCOUNTER_PILE_X,
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
                    if(type === 'encounter') {
                        [effect] = yield* cards.get(effect).draw(runner, socket, data.me(), card);
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
    }
};