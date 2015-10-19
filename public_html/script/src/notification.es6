'use strict';
import {default as $} from 'jquery';

export let error = (err) => {
    let $box = $('#notification #error')
        .css('opacity', 1);
    $box.children('#error-message')
        .text(err);
    window.setTimeout(() => $box.css('opacity', 0), 6000);
};

export let success = (msg) => {
    let $box = $('#notification #success')
        .css('opacity', 1);
    $box.children('#success-message')
        .text(msg);
    window.setTimeout(() => $box.css('opacity', 0), 6000);
};

export let news = (msg) => {
    let $box = $('#notification #news')
        .css('opacity', 1);
    $box.children('#news-message')
        .text(msg);
    window.setTimeout(() => $box.css('opacity', 0), 6000);
};