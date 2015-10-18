'use strict';
let express = require('express');
let app = express();
let server = app.listen(8888, () => {
    console.log('Server started at 8888');
});
app.use('', express.static('public_html'));

let io = require('socket.io')(server);

let games = [];
let users = [];

io.on('connection', (socket) => {
    socket.on('error', (err) => {
        console.error(err);
    });


});