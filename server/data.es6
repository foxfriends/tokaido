'use strict';
let fs = require('fs');

let cards = require('../cards');
let games = {};

let shuffle = (a) => {
    let n = a.length;
    while(0 <-- n) {
        let r = Math.floor(Math.random() * (n + 1));
        [a[0], a[r]] = [a[r], a[0]];
    }
    return a;
};

let iPlayers = function*(g) {
    for(let name of Object.keys(games[g].players)) {
        yield games[g].players[name];
    }
};

let insert = (g,p,c,...rest) => {
    const order = {
        'encounter': 0,
        'springs': 1,
        'meal': 2,
        'souvenir': 3,
        'achievement-gold': 4,
        'achievement-blue': 5,
        'panorama paddy': 6,
        'panorama mountain': 7,
        'panorama sea': 8
    };
    let family = [false, false, false, false, false];
    games[g].players[p].cards = (function ins(c, f, ...rest) {
        if(f === undefined) { return [c]; }
        if(cards.get(c).type === 'souvenir') {
            if(order[cards.get(f).type] === 'souvenir') {
                if(!family[cards.get(f).family]) {
                    family[cards.get(f).family] = true;
                } else {
                    family = [false, false, false, false, false];
                    return [c, f, ...rest];
                }
            }
        }
        if(order[cards.get(c).type] < order[cards.get(f).type]) { return [c, f, ...rest]; }
        return [f, ...ins(c, ...rest)];
    })(c, ...games[g].players[p].cards);
    if(rest.length > 0) { insert(g, p, ...rest); }
};

module.exports = {
    get: (g) => games[g],
    set: (g,f,d,e) => d !== undefined ? (e !== undefined ? games[g][f][d] = e : games[g][f] = d) : games[g] = f,
    remove: (g) => delete games[g],
    getCard: (g,t,i = 0,n = 1) => games[g].cards[t].slice(i, n),
    addCard: (g,t,...c) => games[g].cards[t].push(...c),
    giveCard: (g,p,...c) => insert(g,p,...c),
    removeCard: (g,t,n=1) => {
        if(typeof n === 'string') {
            if(games[g].cards[t].indexOf(n) !== -1) {
                return games[g].cards[t].splice(games[g].cards[t].indexOf(n), 1);
            } else {
                return [];
            }
        } else {
            return games[g].cards[t].splice(0, n);
        }
    },
    shuffleCards: (g,t) => games[g].cards[t] = shuffle(games[g].cards[t]),
    discardMeal: (g,m) => games[g].mealset.splice(games[g].mealset.indexOf(m), 1),
    iPlayers: iPlayers,
    getName: (g,i) => Object.keys(games[g].players)[i],
    getPlayer: (g,p) => games[g].players[p],
    setPlayer: (g,p,f,d) => games[g].players[p][f] = d,
    removePlayer: (g, p) => delete games[g].players[p],
    players: (g,e=false) => Object.keys(games[g].players).length + ((e && Object.keys(games[g].players).length === 2) ? 1 : 0),
    make: (g) => games[g] = {
        name: g,
        state: 0,
        playerCount: 1,
        readystate: 0,
        expansions: {
            crossroads: false
        },
        cards: {
            traveller:          ['hiroshige', 'chuubei', 'kinko', 'yoshiyasu',
                                'satsuki', 'mitsukuni', 'sasayakko', 'hirotada',
                                'umegae', 'zen-emon'],
            cr_traveller:       ['jirocho', 'daigoro', 'nampo', 'gotozaemon',
                                'miyataka', 'kita'],
            encounter:          shuffle(['shokunin', 'shokunin', 'annaibito-p',
                                        'annaibito-m', 'annaibito-m', 'annaibito-s',
                                        'annaibito-s', 'annaibito-s', 'samurai',
                                        'samurai', 'kuge', 'kuge', 'miko' ,'miko']),
            souvenir:           shuffle(['gofu', 'yunomi', 'koma', 'uchiwa',
                                        'hashi', 'washi', 'netsuke', 'jubako',
                                        'shikki', 'sumie', 'shamisen', 'ukiyoe',
                                        'manju', 'daifuku', 'sake', 'kamaboko',
                                        'geta', 'yukata', 'ocha', 'konpeito',
                                        'haori', 'furoshiki', 'sandogasa', 'kan zashi']),
            meal:               shuffle(['dango', 'dango', 'dango',
                                        'nigirimeshi', 'nigirimeshi', 'nigirimeshi',
                                        'misoshiru', 'misoshiru', 'misoshiru',
                                        'tofu', 'tofu', 'tempura', 'tempura',
                                        'sushi', 'sushi', 'soba', 'soba',
                                        'yakitori', 'yakitori', 'unagi', 'udon',
                                        'fugu', 'tai meshi', 'sashimi', 'donburi']),
            springs:            shuffle(['springs2','springs2','springs2','springs2','springs2','springs2',
                                        'springs3','springs3','springs3','springs3','springs3','springs3']),
            bathouse:           ['bathouse', 'bathouse', 'bathouse', 'bathouse', 'bathouse', 'bathouse'],
            cherry_tree:        ['cherry', 'cherry', 'cherry', 'cherry', 'cherry', 'cherry'],
            legendary:          ['shodo', 'emaki', 'buppatsu', 'ema', 'murasame', 'masamune'],
            calligraphy:        ['foresight', 'contemplation', 'nostalgia', 'patience', 'perfection', 'fasting'],
            amulet:             ['vitality', 'fortune', 'health', 'friendship', 'hospitality', 'devotion'],
            achievement:        ['ac-paddy', 'ac-mountain', 'ac-sea', 'gourmet', 'chatterbox', 'collector', 'bather']
        },
        mealset: [],
        extra: {
            //Extra character for 2 player mode
            color: '',
            position: -1
        },
        players: {}
    },
    makePlayer: (g, p) => games[g].players[p] = {
        name: p,
        color: '',
        traveller: '',
        coins: 0,
        donations: 0,
        cards: [],
        position: -1,
        connected: true
    },
    load: (g) => {
        try {
            fs.statSync(`./games/${g}.tokaido`);
            games[g] = JSON.parse(fs.readFileSync(`./games/${g}.tokaido`, 'utf8'));
            for(let p of iPlayers(g)) {
                p.connected = false;
            }
            return true;
        } catch(e) {
            return false;
        }
    }
};