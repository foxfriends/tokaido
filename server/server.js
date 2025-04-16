'use strict';
let express = require('express');
let app = express();
let server = app.listen(process.env.tokaido_port || 8888, () => {
    console.log(`Server started at ${process.env.tokaido_port || 8888}`);
});

//Run files through ejs
app.set('view engine', 'ejs');
app.set('views', '');

app.use('/', express.static('public_html'));
app.use('/health', (req, res) => {
  res.send('Ok');
});
//If not calling for a specific file, only page is index.html.ejs
app.use((req, res) => {
    res.render('public_html/index.html.ejs');
});

let io = require('socket.io')(server);

let data = require('./data');
let addPlayer = require('./players').addPlayer;
let common = require('./common')(io);

io.on('connection', (socket) => {
    addPlayer(socket);
    // socket.on('error', (err) => console.error(`Error on socket ${socket.id}: ${err}`));
    require('./join')(socket.id);
    require('./setup')(socket.id);
    require('./game')(socket.id);
    require('./chat')(socket.id);
});
