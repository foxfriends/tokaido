'use strict';
const traveller = require('./traveller.es6');
const souvenir = require('./souvenir.es6');
const encounter = require('./encounter.es6');
const meal = require('./meal.es6');
const legendary = require('./legendary.es6');
const calligraphy = require('./calligraphy.es6');
const amulet = require('./amulet.es6');

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