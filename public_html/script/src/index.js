'use strict';
require('babel-polyfill');
require('../../style/src/main.scss');
// import {default as $} from 'jquery';
import {runner as menu} from './menu.js';
import {runner as setup} from './setup.js';
import {runner as game} from './game.js';
import {runner as finish} from './finish.js';
import './chat.js';
import './rules.js';

//Main game loop
let run; (run = function*() {
    yield* menu(run);
    yield* setup(run);
    yield* game(run);
    yield* finish(run);
}()).next();
