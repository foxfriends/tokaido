'use strict';
let express = require('express');
let app = express();
let server = app.listen(8888, () => {
    console.log('Server started at 8888');
});
app.use('', express.static('public_html'));

let io = require('socket.io')(server);

let data = require('./server/data');
let addPlayer = require('./server/players').addPlayer;
let common = require('./server/common')(io);

io.on('connection', (socket) => {
    addPlayer(socket);
    // socket.on('error', (err) => console.error(`Error on socket ${socket.id}: ${err}`));
    require('./server/join')(socket.id);
    require('./server/colorPhase')(socket.id);
    require('./server/game')(socket.id);
});