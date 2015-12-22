'use strict';
import * as cards from '../../../cards/index.es6';
import {get as data, player, iPlayers} from './data.es6';
import {board} from './board.es6';
import {DONE} from './const.es6';

let souvenirPoints = (p) => {
    let counts = [0, 0, 0, 0, 0];
    for(let card of p.cards) {
        if(cards.get(card) && cards.get(card).family !== undefined) {
            counts[cards.get(card).family]++;
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
        if(cards.get(card) && cards.get(card).score) {
            s += cards.get(card).score(p);
        }
    }
    if(data().state === DONE) {
        let donations = [];
        for(let i of iPlayers()) {
            donations[i.donations] = (donations[i.donations] && donations[i.donations].length) ? [...donations[i.donations], p.name] : [p.name];
        }
        let n = 0;
        let bonus = [10, 7, 4, 2, 2];
        for(let i = donations.length - 1; i >- 0; i--) {
            if(donations[i] && donations[i].length) {
                if(donations[i].indexOf(p.name) !== -1) {
                    s += bonus[n];
                } else {
                    n++;
                }
            }
        }
    }
    return s + souvenirPoints(p) + p.donations;
};