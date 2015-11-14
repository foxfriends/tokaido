'use strict';
require('babel/polyfill');
import {default as $} from 'jquery';
import {socket} from './socket.es6';
import {error} from './notification.es6';
import * as card from './cards.es6';
import * as data from './data.es6';
import * as drag from './board_scroll.es6';
import {board} from './board.es6';
import {
    SCOREBOARD_HEIGHT, BOARD_WIDTH, BOARD_HEIGHT, TITLE_COLOR, TC_WH_RATIO,
    CARD_WH_RATIO, TC_WIDTH, TC_HEIGHT, SETUP, PLAY
} from './const.es6';

let setCardTray = (i, player) => {
    $('.card-tray').eq(i)
        .attr('name', player.name)
        .children('.handle')
            .css({
                opacity: 1,
                top: -48,
                left: (i * 20 + 1) + '%',
                'pointer-events': 'auto'
            })
            .children('div')
                .attr('name', player.traveller)
                .each(function() {
                    $(this).css('height', $(this).width() * TC_WH_RATIO);
                    $(this).parent().css('height', $(this).width() * TC_WH_RATIO - 10);
                    $(this).children().addClass(player.color);
                });
    window.setTimeout(() =>
        $('.card-tray').eq(i).children('.handle')
            .click(function() {
                $(this)
                    .off('mouseover')
                    .off('mouseout')
                    .parent()
                        .css({
                            top: '96px',
                            cursor: 'default',
                            'z-index': 5,
                            'box-shadow': `0 0 10px 0 ${TITLE_COLOR}`
                        })
                        .one('mouseover', function() {
                            $(this).one('mouseout', () => {
                                $(this)
                                    .css({
                                        top: '100%',
                                        cursor: 'pointer',
                                        'box-shadow': `0 0 0 0 ${TITLE_COLOR}`
                                    })
                                    .children('.handle')
                                        .css('top', -48)
                                        .mouseover(function() { $(this).css('top', -$(this).children('.card.traveller').height()); })
                                        .mouseout(function() { $(this).css('top', -48); });
                                window.setTimeout(() => $(this).css('z-index', 3), 1000);
                            });
                        });
            })
            .mouseover(function() { $(this).css('top', -$(this).children('.card.traveller').height()); })
            .mouseout(function() { $(this).css('top', -48); }), 1000);
};

export let runner = function*(runner) {
    let delayArrange = false;
    align_board: {
        const xx = data.get().state > SETUP ? Math.min(0, Math.max(-(BOARD_WIDTH - window.innerWidth), -(board[data.playerOrder()[0].position[0]].x - board[0].x))) : 0;
        //Scroll the view to the beginning
        $('#scoreboard').css('top', 0);
        $('#gameboard').css({
            left: xx,
            top: window.innerHeight - BOARD_HEIGHT + 100,
            opacity: 1
        });
        window.setTimeout(() => {
            $('#gameboard').css('transition', 'all 0s ease 0s');
            drag.activate();
        }, 8000);
    }
    choose_traveller: {
        if(data.get().state > SETUP) {
            break choose_traveller; //jshint ignore:line
        } else {
            //Wait for the board to finish scrolling
            yield window.setTimeout(() => runner.next(), 8000);
        }
        //Wait for everyone to be ready
        socket.emit('game:ready', SETUP);
        yield socket.once('game:ready', () => runner.next());
        const travellers = yield socket.emit('request:travellers', null, (travellers) => runner.next(travellers));
        const cards = [
            card.create({
                name: travellers[0],
                type: 'traveller',
                click: card.selectOne,
                top: -((window.innerHeight + TC_HEIGHT) / 2),
                left: (window.innerWidth / 2) - TC_WIDTH - 50
            }), card.create({
                name: travellers[1],
                type: 'traveller',
                click: card.selectOne,
                top: -((window.innerHeight + TC_HEIGHT) / 2),
                left: (window.innerWidth / 2) + 50
            })
        ];
        card.show(...cards);
        yield window.setTimeout(() => runner.next(), 200);
        cards.forEach(($card) => $card.css('transform', `translateY(${window.innerHeight}px)`));
        const traveller = (yield card.confirm(($s) => $s.length === 1, (c) => runner.next(c))).attr('name');
        cards.forEach(($card) => $card.css('transform', `translateY(${$card.attr('name') === traveller ? window.innerHeight * 2 : 0}px)`));
        window.setTimeout(() => card.remove(...cards), 700);
        yield socket.emit('submit:traveller', traveller, () => runner.next());
        //Wait for other players to choose
        socket.emit('game:ready', PLAY);
        yield socket.once('game:ready', () => runner.next());
        delayArrange = true;
    }
    populate_board: {
        //Position gameboard elements correctly
        setCardTray(0, data.me());
        for(let i = 1; i < data.players(); i++) {
            setCardTray(5 - i, data.player(i));
        }
        for(let player of data.iPlayers()) {
            $('#scoreboard')
                .append($('<div></div>')
                    .css({
                        left: -12,
                        top: -12
                    })
                    .addClass(`disc ${player.color}`)
                    .attr('name', player.name)
                );
            $('#gameboard')
                .append($('<div></div>')
                    .addClass(`player ${player.color}`)
                    .attr('name', player.name)
                );
        }
        if(data.players() === 2) {
            $('#gameboard')
                .append($('<div></div>')
                    .addClass(`player ${data.get().extra.color}`)
                    .attr('name', 'extra')
                );
        }
        if(delayArrange) {
            yield window.setTimeout(() => runner.next(), 10);
        }
        data.arrange();
    }
};