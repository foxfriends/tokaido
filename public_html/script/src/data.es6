'use strict';
let data, game, name;
export let get = () => data;
export let set = (d) => data = d;
export let player = (i) => {
    if(typeof i === 'string') { return data.players[i]; }
    if(i === 0) { return data.players[name]; }
    let n, names = Object.keys(data.players);
    while(i > 0 && names.length) {
        [n] = names.splice(0, 1);
        if(n !== name) { i--; }
    }
    return i ? undefined : data.players[n];
};
export let players = () => Object.keys(data.players).length;
export let me = (n) => data ? data.players[name = n ? n : name] : name = n ? n : name;