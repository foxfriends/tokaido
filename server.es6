'use strict';
let express = require('express');
let app = express();
let server = app.listen(8888, () => {
    console.log('Server started at 8888');
});

//Run files through ejs
app.set('view engine', 'ejs');
app.set('views', './');

app.use('/', express.static('./public_html'));
//If not calling for a specific file, only page is index.html.ejs
app.use((req, res) => { res.render('./public_html/index.html.ejs'); });
let io = require('socket.io')(server);

let data = require('./server/data');
let addPlayer = require('./server/players').addPlayer;
let common = require('./server/common')(io);

io.on('connection', (socket) => {
    addPlayer(socket);
    // socket.on('error', (err) => console.error(`Error on socket ${socket.id}: ${err}`));
    require('./server/join')(socket.id);
    require('./server/setup')(socket.id);
    require('./server/game')(socket.id);
});