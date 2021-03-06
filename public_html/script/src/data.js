'use strict';
require('babel-polyfill');
import {default as $} from 'jquery';
import {score} from './scoring.js';
import {board} from './board.js';
import {
    SCOREBOARD_SPACE_WIDTH, SCOREBOARD_SPACE_HEIGHT, SCOREBOARD_HEIGHT, SCOREBOARD_WIDTH,
    CARD_HEIGHT, CARD_WIDTH,
    SPRINGS_PILE_X, SOUVENIR_PILE_X, ENCOUNTER_PILE_X, MEAL_PILE_X, MEALSET_PILE_X,
    PADDY_PILE_X, MOUNTAIN_PILE_X, SEA_PILE_X, PILE_Y, PANO_PILE_Y, PILE_WIDTH,
    PURPLE_DONATION_PILE, YELLOW_DONATION_PILE, GREEN_DONATION_PILE, WHITE_DONATION_PILE,
    BLUE_DONATION_PILE, DONATION_PILE_Y, DONATION_PILE_ANGLE
} from './const.js';
import * as cards from '../../../cards/index.js';

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
    let [min, max] = [100, 0];
    for(let p in data.players) {
        if(data.players[p].position === -1) { continue; }
        const s = Math.min(100, score(p));
        if(s < min) { min = s; }
        if(s > max) { max = s; }
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
                                left: 10 + 130 * (i % Math.floor(window.innerWidth * 0.8 / 130)),
                                top: 10 + 190 * Math.floor(i / Math.floor(window.innerWidth * 0.8 / 130))
                            })
                    );
                } else {
                    const offset =  (120 * 3 + 10) * (type.indexOf('paddy') === -1 ? 1 : 0) +
                                    (120 * 4 + 10) * (type.indexOf('sea') !== -1 ? 1 : 0);
                    const xx = 10 + (120) * (parseInt(c[c.length - 1]) - 1) + offset;
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
        const color = {
            'purple': PURPLE_DONATION_PILE,
            'yellow': YELLOW_DONATION_PILE,
            'green': GREEN_DONATION_PILE,
            'white': WHITE_DONATION_PILE,
            'blue': BLUE_DONATION_PILE
        };
        let shadow = `0 ${3}px 0 0 #9b7946, 0 ${3}px 0 1px #dca64f`;
        for(let i = 1; i < data.players[p].donations; i++) {
            shadow += `,0 ${3 * (i + 1)}px 0 0 #9b7946, 0 ${3 * (i + 1)}px 0 1px #dca64f`;
        }
        $(`#gameboard .coin[name='${p}']`)
            .css({
                left: -43,
                top: -43,
                transform: `translate(${color[data.players[p].color]}px, ${DONATION_PILE_Y - 3 * data.players[p].donations}px)`,
                opacity: data.players[p].donations > 0 ? 1 : 0,
                'box-shadow': shadow
            })
            .html(`<span>${data.players[p].donations}</span>`);
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
    if(scores.length !== 0) {
        if((min + max) / 2 < 25) {
            $('#scoreboard')
                .css('transform', 'translate(0, 0)');
        } else if((min + max) / 2 > 75) {
            $('#scoreboard')
                .css('transform', `translate(${window.innerWidth - SCOREBOARD_WIDTH}px, 0)`);
        } else {
            $('#scoreboard')
                .css('transform', `translate(${- (SCOREBOARD_WIDTH - window.innerWidth) * ((min + max) / 2 - 25) / 50}px, 0)`);
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
            let shadow = '0 0 0 0px #E6E7E1';
            const color = ['E6E7E1', '778574'];
            for(let i = 1; i < data.cards[type].length; i++) {
                shadow += `, 0 ${i}px 0 0px #${color[i%2]}`;
            }
            $(`#gameboard .stacks .card.${type}:eq(0)`)
                .css({
                    display: 'block',
                    transform: `translate(${xx[type]}px, ${PILE_Y - data.cards[type].length}px) scale(${PILE_WIDTH / CARD_WIDTH}) rotateY(180deg)`,
                    'box-shadow': shadow
                });
        }
    }
    ['paddy', 'mountain', 'sea'].forEach((type) => {
        const taken = (function count(first, ...rest) {
            let n = 0;
            for(let c of first.cards) {
                if(c.indexOf(type) === 0) {
                    n++;
                }
            }
            if(rest.length === 0) {
                return n;
            } else {
                return n + count(...rest);
            }
        })(...iPlayers());
        const xx = {
            paddy: PADDY_PILE_X,
            mountain: MOUNTAIN_PILE_X,
            sea: SEA_PILE_X
        };
        const count = {
            paddy: 15,
            mountain: 20,
            sea: 25
        };
        let shadow = '0 0 0 0px #E6E7E1';
        const color = ['E6E7E1', '778574'];
        for(let i = 1; i < count[type] - taken; i++) {
            shadow += `, 0 ${i}px 0 0px #${color[i%2]}`;
        }
        $(`#gameboard .stacks .card.panorama.${type}:eq(0)`)
            .css({
                display: 'block',
                transform: `translate(${xx[type]}px, ${PANO_PILE_Y - (count[type] - taken)}px) scale(${PILE_WIDTH / CARD_WIDTH}) rotateY(180deg)`,
                'box-shadow': shadow
            });
    });
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
