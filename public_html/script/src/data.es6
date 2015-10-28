'use strict';
let data;
export let get = ( ) => data;
export let set = (d) => data = d;
export let player = (i) => data.players[Object.keys(data.players)[i]];
export let players = () => Object.keys(data.players).length;