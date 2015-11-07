'use strict';
import {default as $} from 'jquery';
import 'jquery-mousewheel';
import {BOARD_WIDTH, BOARD_HEIGHT, SCOREBOARD_HEIGHT} from './const.es6';

const $board = $('#gameboard');
let followMouse = false, x, y, zoom = 1;
let limitPosition, doZoom;

limitPosition = function() {
    if(BOARD_WIDTH * zoom < window.innerWidth) {
        $board.css('left', 0);
    } else if($board.position().left > 0) {
        $board.css('left', 0);
    } else if($board.position().left < -(BOARD_WIDTH * zoom - window.innerWidth)) {
        $board.css('left', -(BOARD_WIDTH * zoom - window.innerWidth));
    }
    if(BOARD_HEIGHT * zoom < window.innerHeight - SCOREBOARD_HEIGHT) {
        while(BOARD_HEIGHT * zoom < window.innerHeight - SCOREBOARD_HEIGHT) {
            doZoom({deltaY: 1});
        }
    }
    if($board.position().top > SCOREBOARD_HEIGHT) {
        $board.css('top', SCOREBOARD_HEIGHT);
    } else if($board.position().top < -(BOARD_HEIGHT * zoom - window.innerHeight)) {
        $board.css('top', -(BOARD_HEIGHT * zoom - window.innerHeight));
    }
};
doZoom = (e) => {
    const [ol, ot] = [(e.pageX - $board.position().left) / zoom, (e.pageY - $board.position().top) / zoom];
    zoom += (e.deltaY) * 0.1;
    if(zoom === 0) { zoom = 0.1; }
    $board
        .css({
            left: e.pageX - (ol * zoom),
            top: e.pageY - (ot * zoom),
            transform: `scale(${zoom})`,
        });
    limitPosition();
};

export let activate = () => {
    $board
        .mousedown((e) => {
            [followMouse, x, y] = [true, e.pageX, e.pageY];
        });
    $('#board')
        .mouseup(() => {
            followMouse = false;
        })
        .mousemove((e) => {
            if(followMouse) {
                $board
                    .css({
                        left: '-=' + (x - e.pageX),
                        top: '-=' + (y - e.pageY)
                    });
                limitPosition();
                [x,y] = [e.pageX, e.pageY];
            }
        })
        .mousewheel(doZoom);
};
export let deactivate = () => {
    $board
        .off('mousedown');
    $('#board')
        .off('mouseup mousemove mousewheel');
};
export let currentZoom = () => zoom;
export let boardRelPos = (xx, yy) => [(xx - $board.position().left) / zoom, (yy - $board.position().top) / zoom];
export let windowRelPos = (xx, yy) => [(xx + $board.position().left) * zoom, (yy + $board.position().top) * zoom];