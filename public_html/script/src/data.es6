'use strict';
require('babel/polyfill');
import {default as $} from 'jquery';
import {score} from './scoring.es6';
import {board} from './board.es6';
import {
    SCOREBOARD_SPACE_WIDTH, SCOREBOARD_SPACE_HEIGHT, SCOREBOARD_HEIGHT,
    CARD_HEIGHT, CARD_WIDTH,
    SPRINGS_PILE_X, SOUVENIR_PILE_X, ENCOUNTER_PILE_X, MEAL_PILE_X, MEALSET_PILE_X,
    PADDY_PILE_X, MOUNTAIN_PILE_X, SEA_PILE_X, PILE_Y, PANO_PILE_Y, PILE_WIDTH,
} from './const.es6';
import * as cards from '../../../cards/index.es6';

let data, name;
export let get = () => data;
export let player = (i) => {
    if(i === 'extra') { return data.extra; }
    if(typeof i === 'string') { return data.players[i]; }
    if(i === 0) { return data.players[name]; }
    let n, names = Object.keys(data.players);
    while(i > 0 && names.length) {
        [n] = names.splice(0, 1);
        if(n !== name) { i--; }
    }
    return i ? undefined : data.players[n];
};
export let players = () => Object.keys(data.players).length;
export let iPlayers = function*(extra) {
    for(let i of Object.keys(data.players)) {
        yield data.players[i];
    }
    if(extra && players() === 2) { yield data.extra; }
};
export let playerOrder = () => {
    let order = [];
    for(let player of iPlayers()) {
        for(let i = 0; i < order.length; i++) {
            if(order[i].position[0] > player.position[0]) {
                order.splice(i, 0, player);
                break;
            } else if(order[i].position[0] === player.position[0]) {
                if(order[i].position[1] < player.position[1]) {
                    order.splice(i, 0, player);
                    break;
                }
            }
        }
        order.push(player);
    }
    return order;
};
export let me = (n) => data ? data.players[name = (n ? n : name)] : name = (n ? n : name);
export let arrange = () => {
    let scorePos = (s = 0) => {
        return [Math.round((s / 2 + 1/2) * SCOREBOARD_SPACE_WIDTH),
                ((s % 2) ? 6 : 49) + SCOREBOARD_SPACE_HEIGHT / 2];
    };
    let scores = [];
    for(let p in data.players) {
        if(data.players[p].position === -1) { continue; }
        const s = score(p);
        const [sx, sy] = scorePos(s);
        scores[s] = (scores[s] && scores[s].length) ? [...scores[s], p] : [p];
        $(`#scoreboard .disc[name="${p}"]`)
            .css('transform', `translate(${sx}px, ${sy}px)`);
        const {x, y, spacing: spa, direction: dir} = board[data.players[p].position[0]];
        const [px, py] = [x, y + spa * dir * data.players[p].position[1]];
        $(`#gameboard .player[name="${p}"]`)
            .css({
                'transform': `translate(${px}px, ${py}px)`,
                'z-index': dir * data.players[p].position[1] + 5
            });
        if($(`.card-tray[name="${p}"] .card:not(.traveller)`).length !== data.players[p].cards.length) {
            $(`.card-tray[name="${p}"] .card:not(.traveller)`).remove();
            data.players[p].cards.forEach((c, i) => {
                let type = cards.get(c).type;
                if(type.indexOf('panorama') === -1) {
                    $(`.card-tray[name="${p}"]`).append(
                        $('<div></div>')
                            .addClass(`card ${type}`)
                            .attr('name', c)
                            .css({
                                left: 10 + 160 * (i % Math.floor(window.innerWidth * 0.8 / 160)),
                                top: 10 + 240 * Math.floor(i / Math.floor(window.innerWidth * 0.8 / 160))
                            })
                    );
                } else {
                    const offset =  (150 * 3 + 10) * (type.indexOf('paddy') === -1 ? 1 : 0) +
                                    (150 * 4 + 10) * (type.indexOf('sea') !== -1 ? 1 : 0);
                    const xx = 10 + (CARD_WIDTH / 2) * (parseInt(c[c.length - 1]) - 1) + offset;
                    $(`.card-tray[name="${p}"]`).append(
                        $('<div></div>')
                            .addClass(`card ${type}`)
                            .attr('name', c)
                            .css({
                                left: xx,
                                top: window.innerHeight - SCOREBOARD_HEIGHT - 20 - CARD_HEIGHT / 2
                            })
                    );
                }
            });
        }
        let n = $(`.card-tray[name="${p}"] .coin`).length;
        while(data.players[p].coins > n) {
            $(`.card-tray[name="${p}"]`).append(
                $('<div></div>')
                    .addClass('coin')
                    .css({
                        left: `${95 - Math.random() * 10}%`,
                        top: `${Math.random() * 30 + 3}%`
                    })
            );
            n++;
        }
        while(data.players[p].coins < n) {
            $(`.card-tray[name="${p}"] .coin:eq(0)`).remove();
            n--;
        }
    }
    for(let s in scores) {
        if(scores[s] && scores[s].length > 1) {
            const [x, y] = scorePos(s);
            scores[s].forEach((p, i) => {
                const [xx, yy] = [  x + 12 * ((i % 2 === 0) ? -1 : 1) * ((i === 2 && scores[s].length === 3) ? 0 : 1) * (i === 4 ? 0 : 1),
                                    y + 12 * ((scores[s].length <= 2) ? 0 : 1) * ((i < 2) ? 1 : -1) * ((i === 4) ? 0 : 1)];
                $(`#scoreboard .disc[name="${p}"]`)
                    .css({
                        transform: `translate(${xx}px, ${yy}px)`,
                        'z-index': i
                    });
            });
        }
    }
    if(players() === 2) {
        if(data.extra.position !== -1) {
            const {x, y, spacing: spa, direction: dir} = board[data.extra.position[0]];
            const [px, py] = [x, y + dir * spa * data.extra.position[1]];
            $('#gameboard .player[name="extra"]')
                .css({
                    'transform': `translate(${px}px, ${py}px)`,
                    'z-index': dir * data.extra.position[1] + 5
                });
        }
    }
    const xx = {
        souvenir: SOUVENIR_PILE_X,
        springs: SPRINGS_PILE_X,
        encounter: ENCOUNTER_PILE_X,
        meal: MEAL_PILE_X
    };
    for(let type of Object.keys(data.cards)) {
        if(xx[type] !== undefined) {
            let shadow = '0 0 0 0px #778574';
            for(let i = 1; i < data.cards[type].length; i++) {
                shadow += `, 0 ${i}px 0 0px #778574`;
            }
            $(`#gameboard .stacks .card.${type}:eq(0)`)
                .css({
                    display: 'block',
                    transform: `translate(${xx[type]}px, ${PILE_Y - data.cards[type].length}px) scale(${PILE_WIDTH / CARD_WIDTH}) rotateY(180deg)`,
                    'box-shadow': shadow
                });
        }
    }
    if(data.mealset.length) {
        let shadow = '0 0 0 1px #778574';
        for(let i = 1; i < data.mealset.length; i++) {
            shadow += ', 0 2px 0 1px #778574';
        }
        $('#gameboard .stacks .card.meal:eq(1)')
            .css({
                display: 'block',
                transform: `translate(${MEALSET_PILE_X}px, ${PILE_Y}px) scale(${PILE_WIDTH / CARD_WIDTH}) rotate(180deg)`,
                'box-shadow': shadow
            });
    } else {
        $('#gameboard .stacks .card.meal:eq(1)')
            .css('display', 'none');
    }
};
export let set = (d) => { data = d; arrange(); };