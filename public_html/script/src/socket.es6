'use strict';
import {default as io} from 'socket.io-client';
import {set as setData} from './data.es6';

export let socket = io();
socket.on('error', (e) => {
    console.error(e);
    //showAlert(e, 'error');
});
socket.on('notification', (m) => {
    //showAlert(m, 'notification');
});
socket.on('data:update', (d) => setData(JSON.parse(d)));