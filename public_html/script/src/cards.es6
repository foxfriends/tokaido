'use strict';
import {default as $} from 'jquery';
import {CARD_WIDTH, CARD_HEIGHT} from './const.es6';

const $cards = $('#cards');

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
            top: opts.top || (-CARD_WIDTH / 2),
            left: opts.left || (-CARD_HEIGHT / 2),
            transform: opts.transform
        })
        .attr('name', opts.name)
        .click(opts.click);
};

export let selectOne = function() {
    $cards.children('.card').removeClass('selected');
    $(this).addClass('selected');
};
export let select = function() {
    $(this).toggleClass('selected');
};

export let confirm = (valid, cb) => {
    if(cb === undefined) { cb = valid; valid = () => true; }
    $cards.append($(`<div class="button"><span class="en">Confirm &gt;&gt;</span><span class="hover"><span class="jp">確認します</span>&#8202;&#8202;&gt;&gt;</span></div>`)
        .css('right', '50px')
        .click(function() {
            const $selected = $cards.children('.selected');
            if(valid($selected)) {
                $cards.children('.card').off('click');
                $(this).css('right', '-75%');
                window.setTimeout(() => $(this).remove(), 2000);
                cb($cards.children('.selected'));
            }
        })
    );
};

export let coin = (n) => {
    let coinSpawner = (function*() {
        while(n !== 0) {
            const $coin = $(`<div class='coin'></div>`)
                .css({
                    opacity: (n > 0 ? 1 : 0),
                    left: `10%`,
                    top: window.innerHeight - (n > 0 ? 400 : 0)
                });
            $cards.append($coin);
            window.setTimeout(() => $coin.css({
                opacity: 1,
                transform: `translate(0, ${n > 0 ? '' : '-'}400px)`
            }), 100);
            if(n < 0) {
                // Fade out if losing money
                window.setTimeout(() => $coin.css('opacity', 0), 600);
            }
            window.setTimeout(() => $coin.remove(), 700);
            n -= n / Math.abs(n);
            yield window.setTimeout(() => coinSpawner.next(), 100);
        }
    })();
    coinSpawner.next();
};