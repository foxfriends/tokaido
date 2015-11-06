'use strict';
import {board} from './board.es6';
import * as data from './data.es6';
import {socket} from './socket.es6';
import {PLAY} from './const.es6';
import * as action from './action.es6';
import * as evt from './event.es6';

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
                        socket.emit('turn:end');
                    }
                    yield socket.once('turn:end', () => runner.next());
                    continue;
                }
            }
        }
        if(order[0].name === data.me().name) {
            const space = yield* action.move(runner, order[0].name);
            yield socket.emit('turn:move', [data.me().name, space], () => runner.next());
            //yield* board[space[0]].land(runner);
            socket.emit('turn:end');
        }
        yield socket.once('turn:end', () => runner.next());
    }
};