'use strict';
require('babel/polyfill');
import {default as $} from 'jquery';
import {socket} from './socket.es6';
import {error} from './notification.es6';
import * as data from './data.es6';
import {TITLE_COLOR, TC_WH_RATIO, CARD_WH_RATIO} from './const.es6';

let setCardTray = (i) => {
    $('.card-tray').eq(i)
        .children('.handle')
            .css({
                opacity: 1,
                top: -48,
                left: (i * 20 + 1) + '%',
                'pointer-events': 'auto'
            });
    window.setTimeout(() => {
        $('.card-tray').eq(i).children('.handle')
            .click(function() {
                $(this)
                    .off('mouseover')
                    .off('mouseout')
                    .parent()
                        .css({
                            top: '10%',
                            cursor: 'default',
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
                                        .mouseover(function() { $(this).css('top', -$(this).children('.traveller-card').height()); })
                                        .mouseout(function() { $(this).css('top', -48); });
                                });
                        });
            })
            .mouseover(function() { $(this).css('top', -$(this).children('.traveller-card').height()); })
            .mouseout(function() { $(this).css('top', -48); })
            .children('.traveller-card').each(function () {
                $(this)
                    .attr('name', data.player(i).traveller)
                    .css('height', $(this).width() * TC_WH_RATIO)
                    .parent()
                        .css('height', $(this).width() * TC_WH_RATIO - 10);
            });
    }, 8000);
};

let chooseTraveller = function*(travellers, runner) {
    $('#cards')
        .append()
        .append();
    return yield;
};

export let runner = function*(runner) {
    //Scroll the view to the beginning
    $('#scoreboard').css('top', '0');
    $('#gameboard').css('left', '0');
    //Wait for everyone to be ready
    yield socket.once('game:ready', () => runner.next());
    if(data.get('state') !== 0) { return; }
    const travellers = yield socket.emit('request:travellers', null, (travellers) => runner.next(travellers));
    const chosen = yield* chooseTraveller(travellers, runner);
    yield socket.emit('submit:traveller', chosen, () => runner.next());
    //Wait for other players to choose
    socket.emit('game:ready');
    yield socket.once('game:ready', () => runner.next());
    //Position gameboard elements correctly
    setCardTray(0);
    for(let i = 1; i < data.players(); i++) {
        setCardTray(5 - i);
    }
    yield;
};