'use strict';
import {default as $} from 'jquery';

import {socket} from './socket.es6';
import * as data from './data.es6';

export let init = () =>{
    socket.on('chat:message', ({body, author, time}) => {
        $('#chat')
            .append($('<li></li>')
                .html( `<span class='message-author'>${author}</span>
                        <span class='message-time'>${time}</span>
                        <span class='message-body'>${body}</span>`)
                .addClass(data.player(author).color))
            .scrollTop($('#chat').height());
    });
};