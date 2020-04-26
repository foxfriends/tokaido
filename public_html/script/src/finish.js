'use strict';
import {socket} from './socket.js';
import {default as $} from 'jquery';
import * as data from './data.js';
import * as card from './cards.js';
import {
    PILE_WIDTH, CARD_WIDTH, FINISHED
} from './const.js';
import {currentZoom} from './board_scroll.js';
import {instruct} from './notification.js';
import {score} from './scoring.js';

export let runner = function*(runner) {
    if(data.get().state !== FINISHED) {
        socket.emit('game:ready');
        yield socket.once('game:ready', () => runner.next());
        const achievements = yield socket.emit('request:achievements', null, (achievements) => runner.next(achievements));
        for(let player in achievements) {
            if(achievements[player].length === 0) { continue; }
            let $cards = [];
            for(let name of achievements[player]) {
                const [startX, startY] = [window.innerWidth / 2, - window.innerHeight / 2];
                $cards = [...$cards, card.create({
                    name: name,
                    type: 'achievement-gold',
                    transform: `translate(${startX}px, ${startY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`
                })];
            }
            card.show(...$cards);
            yield window.setTimeout(() => runner.next(), 400);
            $cards.forEach(($card, i) => {
                const w = (window.innerWidth - 50) / $cards.length;
                const [scale, xx] = [
                    Math.min(1, w / (CARD_WIDTH + 50)),
                    window.innerWidth / 2 + (i - (($cards.length - 1) / 2)) * Math.min(CARD_WIDTH + 50, w)
                ];
                $card.css('transform', `translate(${xx}px, ${window.innerHeight / 2}px) scale(${scale}) rotateY(0)`);
            });
            yield window.setTimeout(() => runner.next(), 1200);
            $cards.forEach(($card, i) => {
                const [endX, endY] =
                    [   $(`.card-tray[name="${player}"] .handle`).position().left + window.innerWidth / 100 * 9,
                        window.innerHeight / 2 * 3];
                $card.css('transform', `translate(${endX}px, ${endY}px) scale(${PILE_WIDTH / CARD_WIDTH * currentZoom()}) rotateY(180deg)`);
                window.setTimeout(() => $card.remove(), 700);
            });
            yield window.setTimeout(() => runner.next(), 1000);
        }
        yield socket.emit('request:final-score', null, () => runner.next());
        socket.emit('game:ready', FINISHED);
        yield socket.once('game:ready', () => runner.next());
    }
    const winner = {
        name: '',
        score: 0
    };
    let plural = true;
    for(let player of data.iPlayers()) {
        const s = score(player);
        if(s > winner.score) {
            winner.name = player.name;
            winner.score = s;
            plural = true;
        } else if(s === winner.score) {
            winner.name += ` and ${player.name}`;
            plural = false;
        }
    }
    instruct(`${winner.name} win${plural ? 's' : ''}!`);
};
