'use strict';
import {default as $} from 'jquery';

import {socket} from './socket.es6';
import * as data from './data.es6';

let format = (time) => {
    const d = new Date(time);
    const [h, m] = [d.getHours() % 12, d.getMinutes()];
    return `${h || 12}:${m}`;
};

export let init = () => {
    socket.on('chat:message', ({body, author, time}) => {
        let $msg = $('<li></li>')
            .html( `${author} <span class='message-time'>(${format(time)})</span>: ${body}`)
            .addClass(data.player(author).color);
        $('#chat')
            .append($msg)
            .scrollTop($('#chat').height() + 64);
        $('#chat-message')
            .triggerHandler('focus');
        $('#chat-message')
            .triggerHandler('blur');
    });
    let timeout;
    $('#chat-message')
        .focus(() => {
            $('#chat-container')
                .css('left', 0)
                .children('ul#chat')
                    .children('li')
                        .css('left', 0);
        })
        .blur(() => {
            window.clearTimeout(timeout);
            timeout = window.setTimeout(() => {
                if($('#chat-message:focus').length === 0) {
                    $('#chat-container').css('left', -500);
                }
            }, 6000);
        });
    $(window).keydown((e) => {
        if(e.which === 13) {
            let $focus = $('#chat-message:focus');
            if($focus.length) {
                if($focus.val() !== '') {
                    socket.emit('chat:post', $focus.val());
                }
                $focus
                    .val('')
                    .blur();
            } else {
                $('#chat-message').focus();
            }
        } else if(e.which === 27) {
            $('#chat-message')
                .val('')
                .blur();
        }
    });
};