'use strict';
import {default as $} from 'jquery';

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
            top: opts.top || 0,
            left: opts.left || 0,
            transform: opts.transform
        })
        .attr('name', opts.name)
        .click(opts.click);
};

export let selectOne = function() {
    $cards.children('.card').removeClass('selected');
    $(this).addClass('selected');
};

export let confirm = (runner, n = -1) => {
    $cards.append($(`<div class="button"><span class="en">Confirm &gt;&gt;</span><span class="hover"><span class="jp">確認します</span>&#8202;&#8202;&gt;&gt;</span></div>`)
        .addClass('button')
        .css('right', '50px')
        .click(function() {
            const $selected = $cards.children('.selected');
            if(n == -1 || $selected.length === n) {
                $(this).css('right', '-75%');
                window.setTimeout(() => $(this).remove(), 2000);
                runner.next($cards.children('.selected'));
            }
        })
    );
};