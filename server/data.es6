'use strict';
let games = {};

let shuffle = (a) => {
    let n = a.length;
    while(0 <-- n) {
        let r = Math.floor(Math.random() * (n + 1));
        [a[0], a[r]] = [a[r], a[0]];
    }
    return a;
};

module.exports = {
    get: (g) => games[g],
    set: (g,f,d) => d !== undefined ? games[g][f] = d : games[g] = f,
    remove: (g) => delete games[g],
    getCard: (g,t) => games[g].cards[t][0],
    addCard: (g,t,c) => games[g].cards[t].push(c),
    removeCard: (g,t) => games[g].cards[t].splice(0,1),
    shuffleCards: (g,t) => games[g].cards[t] = shuffle(games[g].cards[t]),
    iPlayer: function*(g) {
        for(let name of Object.keys(games[g].players)) {
            yield games[g].players[name];
        }
    },
    getName: (g,i) => Object.keys(games[g].players)[i],
    getPlayer: (g,p) => games[g].players[p],
    setPlayer: (g,p,f,d) => games[g].players[p][f] = d,
    removePlayer: (g, p) => delete games[g].players[p],
    players: (g) => Object.keys(games[g].players).length,
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
            hot_springs:        shuffle([2,2,2,2,2,2,3,3,3,3,3,3]),
            bathouse:           [0,0,0,0,0,0],
            cherry_tree:        [0,0,0,0,0,0],
            legendary:          ['shodo', 'emaki', 'buppatsu', 'ema', 'murasame', 'masamune'],
            calligraphy:        ['foresight', 'contemplation', 'nostalgia', 'patience', 'perfection', 'fasting'],
            amulet:             ['vitality', 'fortune', 'health', 'friendship', 'hospitality', 'devotion']
        },
        mealset: [],
        extra: {
            //Extra character for 2 player mode
            turn: 0,
            position: 0
        },
        players: {}
    },
    makePlayer: (g, p) => games[g].players[p] = {
        name: p,
        color: '',
        traveller: '',
        coins: 0,
        donations: 0,
        cards: {
            encounter: [],
            souvenir: [],
            meal: [],
            hot_springs: [],
            bathouse: 0,
            cherry_tree: 0,
            legendary: [],
            calligraphy: [],
            amulet: []
        },
        position: -1,
        connected: true
    }
};