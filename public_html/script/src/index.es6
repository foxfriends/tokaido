'use strict';
require('babel/polyfill');
require('../../style/src/main.scss');
// import {default as $} from 'jquery';
import {default as io} from 'socket.io-client';

import './menu.es6';

let socket = io();
socket.on('error', (e) => {
    console.error(e);
    //showAlert(e, 'error');
});
socket.on('notification', (m) => {
    //showAlert(m, 'notification');
});

//Main game loop
let run; (run = function*() {
    yield;
}).next();