'use strict';
const traveller = require('./traveller');
const souvenir = require('./souvenir');
const encounter = require('./encounter');
const meal = require('./meal');
const legendary = require('./legendary');
const calligraphy = require('./calligraphy');
const amulet = require('./amulet');

const get = (name) => traveller[name] || souvenir[name] || encounter[name] || meal[name] ||
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