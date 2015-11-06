'use strict';
require('babel/polyfill');
import {default as $} from 'jquery';
import {score} from './scoring.es6';
import {board} from './board.es6';
import {SCOREBOARD_SPACE_WIDTH, SCOREBOARD_SPACE_HEIGHT} from './const.es6';

let data, name;
export let get = () => data;
export let player = (i) => {
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
    if(extra) { yield data.extra; }
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
        return [Math.round(((s + (s % 2)) / 2 + 1/2) * SCOREBOARD_SPACE_WIDTH),
                ((s % 2) ? 6 : 49) + SCOREBOARD_SPACE_HEIGHT / 2];
    };
    let scores = [];
    for(let p in data.players) {
        if(data.players[p].position === -1) { continue; }
        const [s, sx, sy] = [ score(p),  ...scorePos(s)];
        scores[s] = scores[s] ? [...scores[s], p] : [p];
        $(`#scoreboard .disc[name="${p}"]`)
            .css('transform', `translate(${sx}px, ${sy}px)`);
        const {x, y, spacing: spa, direction: dir} = board[data.players[p].position[0]];
        const [px, py] = [x, y + spa * dir * data.players[p].position[1]];
        $(`#gameboard .player[name="${p}"]`)
            .css({
                'transform': `translate(${px}px, ${py}px)`,
                'z-index': dir * data.players[p].position[1] + 5
            });
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
};
export let set = (d) => { console.log(d); data = d; arrange(); };