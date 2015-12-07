'use strict';
const data = require('./data');
const {updateData, io} = require('./common')();
const players = require('./players');

module.exports = (id) => {
    let player = players(id);
    let socket = player.socket();

    socket.on('chat:post', (msg) => {
        let swears = new RegExp("\\b((" +
            "(bull)?s[\\s\\.]*h[\\s\\.-]*i[\\s\\.-]*t([\\s\\.]*t)?|" +
            "(dumb)?f[\\s\\.]*u[\\s\\.]*c[\\s\\.]*k|" +
            "b[\\s\\.]*i[\\s\\.]*t[\\s\\.]*c[\\s\\.]*h|" +
            "(bad|smart|dumb)?a[\\s\\.]*s[\\s\\.]*s(hole)?|" +
            "h[\\s\\.]*e[\\s\\.]*l[\\s\\.]*l|" +
            "(bull)?c[\\s\\.]*r[\\s\\.]*a[\\s\\.]*p|" +
            "d[\\s\\.]*i[\\s\\.]*c[\\s\\.]*k|" +
            "d[\\s\\.]*a[\\s\\.]*m[\\s\\.]*(n|m)(i[\\s\\.]*t)?|" +
            "p[\\s\\.]*e[\\s\\.]*n[\\s\\.]*i[\\s\\.]*s|" +
            "t[\\s\\.]*i[\\s\\.]*t([\\s\\.]t)?" +
        ")(ed|ing|er)?(e|ie|y)?s?)+\\b", "i");

        let random_cjk = () => `&#x${(0x4e00 + Math.floor(Math.random() * (0x9faf - 0x4e00))).toString(16)}`;

        while(msg !== (msg = msg.replace(swears, random_cjk())));

        io.to(player.game()).emit('chat:message', {
            body: msg,
            author: player.name(),
            time: Date.now()
        });
    });
};