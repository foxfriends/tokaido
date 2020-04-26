'use strict';
import {default as io} from 'socket.io-client';
import {set as setData} from './data.js';
import {error, notification, success} from './notification.js';

export let socket = io();
socket.on('error', error);
socket.on('notification', notification);
socket.on('success', success);
socket.on('data:update', (d) => setData(JSON.parse(d)));
