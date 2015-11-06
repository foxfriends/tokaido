'use strict';
import {default as $} from 'jquery';
import * as data from './data.es6';
import {board, spaceType} from './board.es6';
import {currentZoom, boardRelPos} from './board_scroll.es6';

let makeDraggable = ($e, onmove, ondrop) => {
    let moveValue;
    let [dragging, mx, my] = [false, 0, 0];
    let pulser = () => {
        let direction = -1, alpha = 1;
        return () => {
            alpha += 0.3/45 * direction;
            if(alpha <= 0.7) {
                alpha = 0.7;
                direction = 1;
            } else if(alpha >= 1) {
                alpha = 1;
                direction = -1;
            }
            $e.css('opacity', alpha);
        };
    };
    let pulse = window.setInterval(pulser(), 1000/30);
    const transition = $e.css('transition');
    $e.css('cursor', 'pointer');
    $e
        .mousedown((e) => {
            dragging = true;
            [mx, my] = boardRelPos(e.pageX, e.pageY);
            $e.css({
                opacity: 1,
                transition: 'all 0s ease 0s',
                transform: `translate(${mx}px, ${my}px)`
            });
            window.clearInterval(pulse);
            e.preventDefault();
            return false;
        })
        .mouseup((e) => {
            dragging = false;
            $e.css('transition', transition);
            pulse = window.setInterval(pulser(), 1000/30);
            ondrop($e, boardRelPos(e.pageX, e.pageY), moveValue);
        });
    $('#board').on('mousemove.draggable', (e) => {
        if(dragging) {
            const [x, y] = boardRelPos(e.pageX, e.pageY);
            $e.css('transform', `translate(${x}px, ${y}px)`);
            moveValue = onmove($e, [x, y]);
        }
    });
    return [$e, () => pulse];
};
let clearDrag = ([$e, pulse]) => {
    $e.off('mousedown mouseup').css({
        opacity: 1,
        cursor: 'default'
    });
    $('#board').off('mousemove.draggable');
    window.clearInterval(pulse());
};

let highlightSpace = (who) => ($e, oldPos, newPos) => {
    let i;
    if(who === 'extra') {
        i = data.get().extra.position[0] + 1;
    } else {
        i = data.player(who).position[0] + 1;
    }
    $(`#gameboard .space`).css('opacity', 0);
    do {
        const playersOnSpace = (function count(first, ...rest) {
            return ((first && first.position[0] === i) ? 1 : 0) + (rest.length ? count(...rest) : 0);
        })(...data.iPlayers(true));
        if(playersOnSpace < board[i].length) {
            const [xx, yy] = [board[i].x, board[i].y + board[i].direction * board[i].spacing * playersOnSpace];
            if(Math.abs(xx - newPos[0]) <= 50 && (Math.abs(yy - newPos[1]) <= 50)) {
                $(`#gameboard .space[data-index="${i}-${playersOnSpace}"]`)
                    .css('opacity', 0.5);
                return [i, playersOnSpace];
            }
        }
    } while(!(board[i++] instanceof spaceType.Inn));
    return null;
};

export let move = function*(runner, who) {
    const drag = makeDraggable($(`#gameboard .player[name="${who}"]`), highlightSpace(who), ($e, newPos, space) => {
        $('#gameboard .space').css('opacity', 0);
        if(space === null || space === undefined) {
            //Go back if not on a space
            const position = (who === 'extra' ? data.get().extra.position : data.player(who).position);
            const [xx, yy] = [  board[position[0]].x,
                                board[position[0]].y +
                                board[position[0]].direction * board[position[0]].spacing * position[1]];
            return $e.css('transform', `translate(${xx}px, ${yy}px)`);
        }
        $e.css({
            opacity: 1,
            transform: `translate(${board[space[0]].x}px, ${board[space[0]].y + board[space[0]].direction * board[space[0]].spacing * space[1]}px)`
        });
        runner.next(space);
    });
    const space = yield;
    clearDrag(drag);
    return space;
};