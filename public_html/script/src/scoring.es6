'use strict';
import {player} from './data.es6';
import {default as cards} from '../../../cards/index.es6';
let souvenirPoints = (p) => {
    let counts = [0, 0, 0, 0, 0];
    for(let card of p.cards) {
        if(p.cards.family !== undefined) {
            counts[p.cards.family]++;
        }
    }
    let s = 0;
    while(counts.reduce((p,c) => p + c, 0) !== 0) {
        let n = 0;
        for(let i = 0; i < 5; i++) {
            if(counts[i] > 0) {
                n++;
                counts[i]--;
            }
        }
        s += [0, 1, 4, 9, 16, 25][n];
    }
    return s;
};
export let score = (p) => {
    if(typeof p !== 'object') { p = player(p); }
    let s = 0;
    for(let card of p.cards) {
        if(cards.get(card).score) {
            s += cards.get(card).score(p);
        }
    }
    return s + souvenirPoints(p) + p.donations;
};