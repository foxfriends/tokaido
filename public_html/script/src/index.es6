'use strict';
require('babel/polyfill');
require('../../style/src/main.scss');
// import {default as $} from 'jquery';
import {runner as menu} from './menu.es6';
import {runner as game} from './game.es6';
import './chat.es6';

//Main game loop
let run; (run = function*() {
    yield* menu(run);
    yield* game(run);
}()).next();