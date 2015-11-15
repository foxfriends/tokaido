'use strict';
import {default as $} from 'jquery';
import {CARD_WIDTH, CARD_HEIGHT} from './const.es6';

const $cards = $('#cards');
let flipCards = window.setInterval(() => {
    $('.card').each(function() {
        let seg = $(this).css('transform').split(',')[0];
        const angle = Math.acos(parseFloat(seg.substr(seg.indexOf('(') + 1)));
        if(angle * 180 / Math.PI > 90) {
            $(this).css('backface-visibility', 'visible');
        } else {
            $(this).css('backface-visibility', 'hidden');
        }
    });
}, 1000/30);

export let show = (...cards) => {
    cards.forEach(($card) => $cards.append($card));
};

export let remove = (...cards) => {
    cards.forEach(($card) => $card.remove());
};

export let create = (opts) => {
    return $('<div></div>')
        .addClass('card')
        .addClass(opts.type)
        .css({
            left: opts.left || (-CARD_WIDTH / 2),
            top: opts.top || (-CARD_HEIGHT / 2),
            transform: opts.transform
        })
        .attr('name', opts.name)
        .click(opts.click);
};

export let selectOne = function() {
    let dont = false;
    if($(this).hasClass('selected')) { dont = true; }
    $cards.children('.card').removeClass('selected');
    if(!dont) {
        $(this).addClass('selected');
    }
};
export let select = function() {
    $(this).toggleClass('selected');
};

export let confirm = (valid, cb) => {
    if(cb === undefined) { cb = valid; valid = () => true; }
    const $button = $(`<div class="button"><span class="en">Confirm &gt;&gt;</span><span class="hover"><span class="jp">確認します</span>&#8202;&#8202;&gt;&gt;</span></div>`)
        .click(function() {
            const $selected = $cards.children('.selected');
            if(valid($selected)) {
                $cards.children('.card').off('click');
                $(this).css('right', '-75%');
                window.setTimeout(() => $(this).remove(), 2000);
                cb($cards.children('.selected'));
            }
        });
    $cards.append($button);
    window.setTimeout(() => $button.css('right', '50px'), 100);
};

export let coin = (n) => {
    let coinSpawner = (function*() {
        while(n !== 0) {
            const $coin = $(`<div class='coin'></div>`)
                .css({
                    opacity: (n > 0 ? 0 : 1),
                    left: -43,
                    top: window.innerHeight - (n > 0 ? 400 : 0),
                    transform: `translate(${window.innerWidth / 10}px, 0)`
                });
            $cards.append($coin);
            window.setTimeout(() => $coin.css({
                opacity: 1,
                transform: `translate(${window.innerWidth / 10}px, ${n > 0 ? '' : '-'}400px) rotateY(720deg)`
            }), 100);
            if(n < 0) {
                // Fade out if losing money
                window.setTimeout(() => $coin.css('opacity', 0), 600);
            }
            window.setTimeout(() => $coin.remove(), 700);
            yield window.setTimeout(() => coinSpawner.next(), 250);
            n -= n / Math.abs(n);
        }
    })();
    coinSpawner.next();
};