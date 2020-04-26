'use strict';
const traveller = require('./traveller.js');
const souvenir = require('./souvenir.js');
const encounter = require('./encounter.js');
const meal = require('./meal.js');
const legendary = require('./legendary.js');
const calligraphy = require('./calligraphy.js');
const amulet = require('./amulet.js');

let capitalize = (s) => s[0].toUpperCase() + s.substr(1);

let other = (n) => {
    const last = parseInt(n.substr(-1));
    if(!isNaN(last)) {
        n = n.substr(0, n.length - 1);
        if(n === 'springs') {
            return {
                name: 'Hot Springs',
                type: 'springs',
                score(player) { return last + (player.traveller === 'mitsukuni' ? 1 : 0); }
            };
        } else if(n === 'paddy' || n === 'mountain' || n === 'sea') {
            return {
                name: `${capitalize(n)} Panorama`,
                type: `panorama ${n}`,
                score() { return last; }
            };
        }
    } else {
        return {
            name: n,
            type: `achievement-${n.substr(0, 2) === 'ac' ? 'blue' : 'gold'}`,
            score(player) { return 3 + (player.traveller === 'mitsukuni' ? 1 : 0); }
        };
    }
};

const get = (name) => traveller[name] || souvenir[name] || encounter[name] || meal[name] ||
                    legendary[name] || calligraphy[name] || amulet[name] || other(name);

module.exports = {
    traveller: traveller,
    souvenir: souvenir,
    encounter: encounter,
    meal: meal,
    legendary: legendary,
    calligraphy: calligraphy,
    amulet: amulet,
    get: get
};
