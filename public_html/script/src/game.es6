'use strict';
require('babel/polyfill');
import {default as $} from 'jquery';
import {socket} from './socket.es6';
import {error} from './notification.es6';

export let runner = function*(run) {
    yield;
};