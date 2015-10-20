'use strict';
require('babel/polyfill');
import {default as $} from 'jquery';
import {socket} from './socket.es6';
import {error} from './notification.es6';

let moveShadow = (where) => {
    //Place the shadow behind the selected color
    let $shadow = $('#title div#color-form .disc.shadow');
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
    $(`#title div#color-form .disc:not(.shadow)`)
        .css({
            opacity: 0.5,
            cursor: 'default'
        })
        .off('click');
    colors.forEach((col) => {
        $(`#title div#color-form .disc.${col}`)
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
    let $h2, $game, $name, $namesButton;
    open_page: {
        //fade in everything when the page opens
        $('#title').css('opacity', 1);
        yield window.setTimeout(() => runner.next(), 1000);
        $('#title h1,#title h3').css('opacity', 1);
        yield window.setTimeout(() => runner.next(), 1000);
        $h2 = $('#title h2')
            .css({
                opacity: 1,
                cursor: 'pointer'
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
        $game = $('#title input#game')
            .css('top', '200px')
            .attr('tabindex', 1)
            .focus()
            .keydown((ev) => {
                if(ev.keyCode == 13) {
                    $name.focus();
                }
            });
        yield window.setTimeout(() => runner.next(), 700);
        $name = $('#title input#name')
            .css('top', '300px')
            .attr('tabindex', 2)
            .keydown((ev) => {
                if(ev.keyCode == 13) {
                    $namesButton.click();
                }
            });
        yield window.setTimeout(() => runner.next(), 700);
        $namesButton = $('#title div#button-names')
            .css('top', '400px');
    }
    join_game: {
        //When submit is clicked, attempt to join the game, repeating until it works
        for(;;) {
            yield $namesButton.one('click', () => runner.next());
            let game = $game.val();
            let name = $name.val();
            if(game === '' || game.length > 80) { $game.addClass('error').focus(); error('Game name is invalid'); continue; }
            if(name === '' || name.length > 80) { $name.addClass('error').focus(); error('Your name is invalid'); continue; }
            let [err, colors] = yield socket.emit('game:join', {game: game, name: name}, (err, colors) => runner.next([err, colors]));
            if(err !== null) { error(err); continue; }
            //Slide away the menu
            $game.css('left', '-75%').attr('tabindex', -1);
            $name.attr('tabindex', -1);
            yield window.setTimeout(() => runner.next(), 200);
            $name.css('left', '-75%');
            yield window.setTimeout(() => runner.next(), 200);
            $namesButton.css('right', '125%');
            //If colors have not been chosen yet, choose them now
            if(colors !== 'skip') {
                updateColors(colors);
                moveShadow();
                $('#title div#color-form').css('left', '25%');
                let $colorsButton = $('#title div#button-colors')
                    .css('right', '25%');
                $('#title div#color-form .disc.shadow').css('position', 'absolute');
                socket.on('color:update', (updatedColors) => {
                    updateColors(updatedColors);
                });
                yield $colorsButton.click(() => {
                    if($('#title div#color-form .disc.shadow').css('opacity') === '0') { error('Please select a colour'); return; }
                    socket.emit('color:ready', {}, () => runner.next());
                });
                $colorsButton.off('click');
                socket.removeAllListeners('color:update');
            }
            break;
        }
    }
    //Fade out the whole title screen
    $('#title').css({
        'opacity': 0,
        'pointer-events': 'none'
    });
    $('#rules').css('display', 'block');
    return;
};