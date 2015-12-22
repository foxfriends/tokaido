'use strict';
require('babel-polyfill');
import {default as $} from 'jquery';
import {socket} from './socket.es6';
import {error} from './notification.es6';
import {showRules, hideRules} from './rules.es6';
import {BOARD_WIDTH, BOARD_HEIGHT, SCOREBOARD_HEIGHT} from './const.es6';
import * as data from './data.es6';

let moveShadow = (where) => {
    //Place the shadow behind the selected color
    const $shadow = $('#title div#color-form .disc.shadow');
    if(where === undefined) { return $shadow.css('opacity', 0); }
    $shadow
        .css({
            opacity: 1,
            left: $(where).position().left,
            top: $(where).position().top,
            'z-index': -1
        });
};

let updateColors = (colors) => {
    //Change which colors are available as players pick new ones
    $(`#color-form .disc:not(.shadow)`)
        .css({
            opacity: 0.5,
            cursor: 'default'
        })
        .off('click');
    colors.forEach((col) => {
        $(`#color-form .disc.${col}`)
            .css({
                opacity: 1,
                cursor: 'pointer'
            })
            .click(function() {
                let newColor = $(this).attr('class').substr(5);
                socket.emit('color:change', newColor, (err) => {
                    if(err) { error(err); return; }
                    moveShadow(this);
                });
            });
    });
};

//Move around the menu pieces
export let runner = function*(runner) {
    const [$h2, $game, $name, $namesButton] = [$('#title h2'), $('#game'), $('#name'), $('#button-names')];
    let rules, expansions;
    open_page: {
        //fade in everything when the page opens
        $('#title').css('opacity', 1);
        yield window.setTimeout(() => runner.next(), 1000);
        $('#title h1,#title h3').css('opacity', 1);
        yield window.setTimeout(() => runner.next(), 1000);
        $h2.css({
                opacity: 1,
                cursor: 'pointer'
            });
        //Position the board in the right starting location
        $('#gameboard')
            .css({
                left: -(BOARD_WIDTH - window.innerWidth),
                width: BOARD_WIDTH,
                height: BOARD_HEIGHT,
                top: SCOREBOARD_HEIGHT,
                opacity: 0
            });
    }
    click_play: {
        //When the user clicks play, display the game/name boxes
        yield $h2.one('click', () => runner.next());
        $h2.css({
            opacity: 0,
            cursor: 'default'
        });
        $('#title input').on('input', function() {
            $(this).removeClass('error');
        });
        $game.css('top', '200px')
            .attr('tabindex', 1)
            .focus()
            .keydown((ev) => {
                if(ev.keyCode == 13) {
                    $name.focus();
                }
            });
        yield window.setTimeout(() => runner.next(), 700);
        $name.css('top', '300px')
            .attr('tabindex', 2)
            .keydown((ev) => {
                if(ev.keyCode == 13) {
                    $namesButton.click();
                }
            });
        yield window.setTimeout(() => runner.next(), 700);
        $namesButton.css('top', '400px');
    }
    join_game: {
        //When submit is clicked, attempt to join the game, repeating until it works
        for(;;) {
            yield $namesButton.one('click', () => runner.next());
            const game = $game.val();
            const name = $name.val();
            if(game === '' || game.length > 80) { $game.addClass('error').focus(); error('Game name is invalid'); continue; }
            if(name === '' || name.length > 80) { $name.addClass('error').focus(); error('Your name is invalid'); continue; }
            const [err, action] = yield socket.emit('game:join', {game: game, name: name}, (err, action) => runner.next([err, action]));
            data.me(name);
            if(err !== null) { error(err); continue; }
            //Slide away the menu
            $game.css('left', '-75%').attr('tabindex', -1);
            $name.attr('tabindex', -1);
            yield window.setTimeout(() => runner.next(), 200);
            $name.css('left', '-75%');
            yield window.setTimeout(() => runner.next(), 200);
            $namesButton.css('right', '125%');
            //If the game has just been created, deal with settings
            if(action.options !== 'skip') {
                //Set the settings if you are the game creator
                const $optionsForm = $('#options-form').css('left', '25%');
                const $optionsButton = $('#button-options')
                    .css('right', '25%');
                const $playerCountOptions = $('#player-count .select-option')
                    .click(function() {
                        $(this).parent()
                            .attr('data-value', $(this).text());
                    });
                const $useCrossroads = $('#use-crossroads')
                    .click(function() {
                        $(this).toggleClass('checked');
                    });
                yield $optionsButton.click(() => {
                    $useCrossroads.off('click');
                    $playerCountOptions.off('click');
                    $optionsButton.off('click');
                    socket.emit('options:set', {
                        playerCount: $('#player-count').attr('data-value'),
                        crossroads: $useCrossroads.hasClass('checked')
                    }, () => runner.next());
                });
                $optionsForm.css('left', '-75%');
                $optionsButton.css('right', '125%');
            }
            //If colors have not been set yet, set them
            if(action.colors !== 'skip') {
                updateColors(action.colors);
                moveShadow();
                $('#color-form').css('left', '25%');
                const $colorsButton = $('#button-colors')
                    .css('right', '25%');
                $('#color-form .disc.shadow').css('position', 'absolute');
                socket.on('color:update', (updatedColors) => {
                    updateColors(updatedColors);
                });
                expansions = yield $colorsButton.click(() => {
                    if($('#color-form .disc.shadow').css('opacity') === '0') { error('Please select a colour'); return; }
                    //Get the expansions so the rules can be show correctly
                    socket.emit('color:ready', {}, (expansions) => runner.next(expansions));
                });
                $colorsButton.off('click');
                socket.removeAllListeners('color:update');
                //Show the rules after choosing color
                rules = true;
            }
            break;
        }
    }
    //Fade out the whole title screen
    $('#title').css({
        'opacity': 0,
        'pointer-events': 'none'
    });
    //Wait for the rules to be closed (if they are open)
    if(rules) {
        showRules(expansions);
        yield $('#button-rules').one('click', () => runner.next());
    }
    return;
};