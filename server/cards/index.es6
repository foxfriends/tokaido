'use strict';
let traveller = require('./traveller');
let souvenir = require('./souvenir');
let encounter = require('./encounter');
let meal = require('./meal');
let legendary = require('./legendary');
let calligraphy = require('./calligraphy');
let amulet = require('./amulet');

let get = (name) => traveller[name] || souvenir[name] || encounter[name] || meal[name] ||
                    legendary[name] || calligraphy[name] || amulet[name];

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