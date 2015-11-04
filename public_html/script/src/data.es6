'use strict';
require('babel/polyfill');
import {default as $} from 'jquery';
import {score} from './scoring.es6';
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
export let iPlayers = function*() {
    for(let i of Object.keys(data.players)) {
        yield data.players[i];
    }
};
export let me = (n) => data ? data.players[name = (n ? n : name)] : name = (n ? n : name);
export let arrange = () => {
    let scorePos = (s = 0) => {
        return [Math.round(((s + (s % 2)) / 2 + 1/2) * SCOREBOARD_SPACE_WIDTH),
                ((s % 2) ? 6 : 49) + SCOREBOARD_SPACE_HEIGHT / 2];
    };
    let scores = [];
    for(let player in data.players) {
        const [s, x, y] = [ score(player),  ...scorePos(s)];
        scores[s] = scores[s] ? [...scores[s], player] : [player];
        $(`#scoreboard .disc[name="${player}"]`)
            .css('transform', `translate(${x}px, ${y}px)`);
    }
    for(let s in scores) {
        if(scores[s] && scores[s].length > 1) {
            const [x, y] = scorePos(s);
            scores[s].forEach((player, i) => {
                const [xx, yy] = [  x + 12 * ((i % 2 === 0) ? -1 : 1) * ((i === 2 && scores[s].length === 3) ? 0 : 1) * (i === 4 ? 0 : 1),
                                    y + 12 * ((scores[s].length <= 2) ? 0 : 1) * ((i < 2) ? 1 : -1) * ((i === 4) ? 0 : 1)];
                $(`#scoreboard .disc[name="${player}"]`)
                    .css({
                        transform: `translate(${xx}px, ${yy}px)`,
                        'z-index': i
                    });
            });
        }
    }
};
export let set = (d) => { data = d; arrange(); };